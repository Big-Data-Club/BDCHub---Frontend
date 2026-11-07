import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import { IndexeddbPersistence } from "y-indexeddb";
import { workspaceService, WorkspaceError } from "./workspaceService";
import type { CollaborationStatus, WorkspaceUser } from "../types";

const remote = Symbol("workspace-server");
export function encodeUpdate(update: Uint8Array): string {
  let result = "";
  for (let at = 0; at < update.length; at += 8192)
    result += String.fromCharCode(...update.subarray(at, at + 8192));
  return btoa(result);
}
export function decodeUpdate(update: string): Uint8Array {
  return Uint8Array.from(atob(update), (character) => character.charCodeAt(0));
}

export class WorkspaceProvider {
  readonly doc = new Y.Doc();
  readonly awareness = new Awareness(this.doc);
  private recoveryDoc = new Y.Doc();
  private persistence: IndexeddbPersistence | null = null;
  private socket: WebSocket | null = null;
  private updates: Uint8Array[] = [];
  private pending = new Map<string, string>();
  private stopped = false;
  private connected = false;
  private everConnected = false;
  private repair = false;
  private access = 0;
  private retries = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private awarenessTimer: ReturnType<typeof setTimeout> | undefined;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private heartbeat: ReturnType<typeof setInterval> | undefined;
  private status: CollaborationStatus = {
    state: "connecting",
    pending: 0,
    access: 0,
  };
  private subscribers = new Set<(status: CollaborationStatus) => void>();
  constructor(
    readonly pageId: string,
    readonly generation: number,
    readonly user: WorkspaceUser,
    private onRefresh: () => void,
  ) {
    this.awareness.setLocalStateField("user", {
      name: user.name,
      color: "#2563eb",
    });
    this.doc.on("update", this.onDocumentUpdate);
    this.awareness.on("update", this.onAwarenessUpdate);
  }
  get currentStatus() {
    return this.status;
  }
  get editable() {
    return (
      this.everConnected &&
      this.access >= 3 &&
      !["revoked", "restored"].includes(this.status.state)
    );
  }
  subscribe(listener: (status: CollaborationStatus) => void) {
    this.subscribers.add(listener);
    listener(this.status);
    return () => {
      this.subscribers.delete(listener);
    };
  }
  private publish(state: CollaborationStatus["state"], message?: string) {
    this.status = {
      state,
      message,
      access: this.access,
      pending: this.pending.size + this.updates.length,
    };
    for (const listener of this.subscribers) listener(this.status);
  }
  async start() {
    try {
      this.persistence = new IndexeddbPersistence(
        `bdc-workspace:${this.user.id}:${this.pageId}:${this.generation}`,
        this.recoveryDoc,
      );
      await this.persistence.whenSynced;
    } catch {
      this.publish(
        "connecting",
        "Trình duyệt chưa cho phép giữ bản nháp cục bộ.",
      );
    }
    if (this.stopped) return;
    window.addEventListener("beforeunload", this.beforeUnload);
    window.addEventListener("online", this.reconnect);
    this.heartbeat = setInterval(() => {
      if (this.connected) this.send({ type: "sync" });
    }, 15000);
    await this.connect();
  }
  private beforeUnload = (event: BeforeUnloadEvent) => {
    if (this.pending.size || this.updates.length) {
      event.preventDefault();
      event.returnValue = "";
    }
  };
  private reconnect = () => {
    if (
      !this.connected &&
      !this.stopped &&
      !["revoked", "restored"].includes(this.status.state)
    ) {
      clearTimeout(this.reconnectTimer);
      void this.connect();
    }
  };
  private send(value: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN)
      this.socket.send(JSON.stringify(value));
  }
  private onDocumentUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === remote || this.stopped) return;
    if (!this.everConnected) return; // Recovered IndexedDB state is merged after receiving the authoritative server state.
    if (this.access >= 3) Y.applyUpdate(this.recoveryDoc, update);
    if (this.repair) {
      this.updates = [Y.encodeStateAsUpdate(this.doc)];
      this.repair = false;
      this.pending.clear();
    } else this.updates.push(update);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 250);
    this.publish(this.connected ? "saving" : "offline");
  };
  private onAwarenessUpdate = (
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown,
  ) => {
    if (
      origin === remote ||
      !this.connected ||
      ![...added, ...updated, ...removed].includes(this.doc.clientID)
    )
      return;
    if (this.awarenessTimer) return;
    this.awarenessTimer = setTimeout(() => {
      this.awarenessTimer = undefined;
      if (!this.connected || this.stopped) return;
      this.send({
        type: "awareness",
        data: encodeUpdate(
          encodeAwarenessUpdate(this.awareness, [this.doc.clientID]),
        ),
      });
    }, 125);
  };
  private flush() {
    if (
      !this.connected ||
      this.access < 3 ||
      !this.updates.length ||
      this.stopped
    )
      return;
    const update = encodeUpdate(Y.mergeUpdates(this.updates));
    this.updates = [];
    const operation = crypto.randomUUID();
    this.pending.set(operation, update);
    this.send({
      type: "update",
      operation_id: operation,
      generation: this.generation,
      update,
    });
    this.publish("saving");
  }
  private async connect() {
    if (
      this.stopped ||
      this.socket?.readyState === WebSocket.CONNECTING ||
      this.connected
    )
      return;
    try {
      const { ticket } = await workspaceService.ticket(this.pageId);
      if (this.stopped) return;
      const endpoint = new URL("/workspace-ws", window.location.href);
      endpoint.protocol =
        window.location.protocol === "https:" ? "wss:" : "ws:";
      this.socket = new WebSocket(endpoint);
      this.socket.onopen = () =>
        this.send({ type: "auth", ticket, client_id: this.doc.clientID });
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data));
          if (message.type === "ready" || message.type === "state") {
            if (message.generation !== this.generation) {
              this.connected = false;
              this.access = 0;
              this.publish(
                "restored",
                "Trang đã khôi phục phiên bản. Tải lại để tiếp tục; bản nháp cũ vẫn giữ trên thiết bị.",
              );
              this.socket?.close();
              return;
            }
            const server = new Y.Doc();
            if (message.state)
              Y.applyUpdate(server, decodeUpdate(message.state));
            this.access = message.access;
            if (message.state)
              Y.applyUpdate(this.doc, decodeUpdate(message.state), remote);
            if (message.type === "ready" && this.access >= 3)
              Y.applyUpdate(
                this.doc,
                Y.encodeStateAsUpdate(this.recoveryDoc),
                remote,
              );
            const difference = Y.encodeStateAsUpdate(
              this.doc,
              Y.encodeStateVector(server),
            );
            if (this.access >= 3)
              Y.applyUpdate(this.recoveryDoc, Y.encodeStateAsUpdate(this.doc));
            server.destroy();
            this.connected = true;
            this.everConnected = true;
            this.retries = 0;
            if (message.type === "ready") {
              this.pending.clear();
              this.updates =
                difference.length > 2 && this.access >= 3 ? [difference] : [];
              this.onAwarenessUpdate(
                { added: [], updated: [this.doc.clientID], removed: [] },
                null,
              );
              this.flush();
            }
            if (!this.pending.size && !this.updates.length)
              this.publish(this.access >= 3 ? "saved" : "readonly");
          } else if (message.type === "ack") {
            this.pending.delete(message.operation_id);
            this.publish(
              this.pending.size || this.updates.length ? "saving" : "saved",
            );
          } else if (message.type === "permission") {
            const was = this.access;
            this.access = message.access;
            if (this.access < 3)
              this.publish(
                "readonly",
                this.pending.size || this.updates.length
                  ? "Quyền sửa đã thay đổi. Các thay đổi chưa gửi vẫn nằm trong bản nháp."
                  : undefined,
              );
            else if (was < 3) {
              this.updates = [Y.encodeStateAsUpdate(this.doc)];
              this.flush();
            }
          } else if (message.type === "awareness")
            applyAwarenessUpdate(
              this.awareness,
              decodeUpdate(message.data),
              remote,
            );
          else if (message.type === "peer_left")
            removeAwarenessStates(this.awareness, [message.client_id], remote);
          else if (message.type === "refresh") this.onRefresh();
          else if (message.type === "error") {
            this.repair = true;
            this.publish("error", message.message || "Chưa lưu được thay đổi.");
          }
        } catch {
          this.publish(
            "error",
            "Chưa đọc được phản hồi đồng bộ. Bản nháp vẫn được giữ.",
          );
        }
      };
      this.socket.onerror = () => {
        if (!this.stopped) this.publish("offline");
      };
      this.socket.onclose = (event) => {
        this.connected = false;
        if (this.stopped) return;
        if (event.code === 4403 || event.code === 4401) {
          this.access = 0;
          this.publish(
            "revoked",
            "Phiên hoặc quyền truy cập đã thay đổi. Bản nháp chưa đồng bộ vẫn giữ trên thiết bị.",
          );
          return;
        }
        if (event.code === 4409 || this.status.state === "restored") {
          this.access = 0;
          this.publish(
            "restored",
            "Trang đã khôi phục phiên bản. Tải lại để tiếp tục.",
          );
          return;
        }
        this.publish(
          "offline",
          "Mất kết nối. Thay đổi chưa được lưu trên máy chủ.",
        );
        this.reconnectTimer = setTimeout(
          () => void this.connect(),
          Math.min(1000 * 2 ** this.retries++, 15000),
        );
      };
    } catch (error) {
      if (this.stopped) return;
      if (
        error instanceof WorkspaceError &&
        [401, 403, 404].includes(error.status)
      ) {
        this.access = 0;
        this.publish("revoked", error.message);
        return;
      }
      this.publish("offline", "Chưa kết nối được Workspace. Đang thử lại.");
      this.reconnectTimer = setTimeout(
        () => void this.connect(),
        Math.min(1000 * 2 ** this.retries++, 15000),
      );
    }
  }
  retry() {
    this.repair = true;
    this.updates = [Y.encodeStateAsUpdate(this.doc)];
    this.pending.clear();
    if (this.connected) this.flush();
    else this.reconnect();
  }
  exportDraft() {
    return JSON.stringify({
      format: "bdc-workspace-yjs",
      page_id: this.pageId,
      generation: this.generation,
      state: encodeUpdate(Y.encodeStateAsUpdate(this.doc)),
    });
  }
  async destroy() {
    this.flush();
    this.stopped = true;
    clearTimeout(this.timer);
    clearTimeout(this.awarenessTimer);
    clearTimeout(this.reconnectTimer);
    clearInterval(this.heartbeat);
    window.removeEventListener("beforeunload", this.beforeUnload);
    window.removeEventListener("online", this.reconnect);
    this.awareness.setLocalState(null);
    this.awareness.off("update", this.onAwarenessUpdate);
    this.doc.off("update", this.onDocumentUpdate);
    this.subscribers.clear();
    const deadline = Date.now() + 1500;
    while (
      this.pending.size &&
      this.socket?.readyState === WebSocket.OPEN &&
      Date.now() < deadline
    )
      await new Promise((resolve) => setTimeout(resolve, 25));
    this.socket?.close();
    await this.persistence?.destroy();
    this.recoveryDoc.destroy();
    this.awareness.destroy();
    this.doc.destroy();
    this.subscribers.clear();
  }
}
