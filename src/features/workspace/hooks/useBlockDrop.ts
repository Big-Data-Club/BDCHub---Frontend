"use client";
import { useEffect, useRef } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { SideMenuExtension } from "@blocknote/core/extensions";
import type {
  WorkspaceEditorInstance,
  WorkspaceBlock,
} from "../components/editor/schema";
import type { WorkspacePage } from "../types";

export const workspaceDragType = "application/x-bdc-workspace-block";
export function startBlockDrag(
  event: ReactDragEvent,
  editor: WorkspaceEditorInstance,
  block: WorkspaceBlock,
) {
  if (
    !editor.isEditable ||
    (event.target instanceof Element &&
      event.target.closest("button,input,textarea"))
  ) {
    event.preventDefault();
    return;
  }
  // Selecting a custom node at drag start remounts its DOM and cancels native drag.
  event.stopPropagation();
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(
    workspaceDragType,
    JSON.stringify({ blockId: block.id }),
  );
}

// Move the existing node in one transaction. IDs, nested children and undo history survive.
export function moveBlock(
  editor: WorkspaceEditorInstance,
  id: string,
  target: string,
  after: boolean,
) {
  if (id === target || !editor.isEditable) return;
  editor.transact((tr) => {
    let source: { pos: number; size: number } | undefined,
      destination = -1;
    tr.doc.descendants((node, pos) => {
      if (node.type.name !== "blockContainer") return;
      if (node.attrs.id === id) source = { pos, size: node.nodeSize };
      if (node.attrs.id === target)
        destination = pos + (after ? node.nodeSize : 0);
    });
    if (
      !source ||
      destination < 0 ||
      (destination >= source.pos && destination <= source.pos + source.size)
    )
      return;
    const node = tr.doc.nodeAt(source.pos)!;
    tr.delete(source.pos, source.pos + source.size);
    tr.insert(tr.mapping.map(destination), node);
  });
}

export function useBlockDrop(
  editor: WorkspaceEditorInstance,
  pages: WorkspacePage[],
  pageId: string,
  onError: (message: string) => void,
) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<{
    x: number;
    y: number;
    active: boolean;
    capture: Element;
    pointerId: number;
    payload: { blockId?: string; pageId?: string };
  } | null>(null);
  const suppressClick = useRef(0);
  const startPointerDrag = (
    event: ReactPointerEvent,
    payload: { blockId?: string; pageId?: string },
  ) => {
    if (
      !editor.isEditable ||
      event.button !== 0 ||
      event.pointerType === "touch" ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target as Element).closest("button,input,textarea,[role=toolbar]")
    )
      return;
    event.preventDefault();
    pointer.current = {
      x: event.clientX,
      y: event.clientY,
      active: false,
      capture: event.currentTarget,
      pointerId: event.pointerId,
      payload,
    };
  };
  useEffect(() => {
    const element = host.current;
    const dom = editor.domElement;
    if (!element || !dom) return;
    let indicated: HTMLElement | null = null;
    let scrollFrame = 0,
      lastPointer: { clientX: number; clientY: number } | null = null;
    const stopScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      lastPointer = null;
    };
    const clear = () => {
      indicated?.removeAttribute("data-workspace-drop");
      indicated = null;
    };
    const targetAt = (event: { clientX: number; clientY: number }) => {
      const bounds = element.getBoundingClientRect(),
        viewport = element
          .closest<HTMLElement>("[data-workspace-scroll]")
          ?.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        (viewport &&
          (event.clientY < viewport.top || event.clientY > viewport.bottom))
      )
        return null;
      const nodes = Array.from(
        dom.querySelectorAll<HTMLElement>(".bn-block-outer[data-id]"),
      );
      let target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>(".bn-block-outer[data-id]");
      if (!target || !dom.contains(target)) {
        target = nodes.reduce<HTMLElement | null>((nearest, node) => {
          const rect = node.getBoundingClientRect(),
            old = nearest?.getBoundingClientRect();
          return !old ||
            Math.abs(event.clientY - (rect.top + rect.height / 2)) <
              Math.abs(event.clientY - (old.top + old.height / 2))
            ? node
            : nearest;
        }, null);
      }
      if (!target) return null;
      const rect = target.getBoundingClientRect();
      return { target, after: event.clientY > rect.top + rect.height / 2 };
    };
    const place = (
      payload: { blockId?: string; pageId?: string },
      match: NonNullable<ReturnType<typeof targetAt>>,
    ) => {
      if (!editor.isEditable) return;
      try {
        if (payload.blockId)
          moveBlock(
            editor,
            payload.blockId,
            match.target.dataset.id!,
            match.after,
          );
        else {
          const child = pages.find(
            (p) => p.id === payload.pageId && p.parent_id === pageId,
          );
          if (child)
            editor.insertBlocks(
              [
                {
                  type: "pageLink",
                  props: { pageId: child.id, title: child.title },
                },
              ],
              match.target.dataset.id!,
              match.after ? "after" : "before",
            );
        }
      } catch (reason) {
        onError(
          reason instanceof Error
            ? reason.message
            : "Chưa di chuyển được khối.",
        );
      }
    };
    const pointerMove = (event: PointerEvent) => {
      const drag = pointer.current;
      if (!drag || !editor.isEditable) return;
      if (
        !drag.active &&
        Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6
      )
        return;
      if (!drag.active) drag.capture.setPointerCapture(drag.pointerId);
      drag.active = true;
      event.preventDefault();
      lastPointer = { clientX: event.clientX, clientY: event.clientY };
      const match = targetAt(event);
      clear();
      if (match) {
        indicated = match.target;
        indicated.dataset.workspaceDrop = match.after ? "after" : "before";
      }
      if (!scrollFrame) scrollFrame = requestAnimationFrame(autoScroll);
    };
    const autoScroll = () => {
      scrollFrame = 0;
      if (!pointer.current?.active || !lastPointer) return;
      const root = element.closest<HTMLElement>("[data-workspace-scroll]"),
        bounds = element.getBoundingClientRect();
      if (
        root &&
        lastPointer.clientX >= bounds.left &&
        lastPointer.clientX <= bounds.right
      ) {
        const rect = root.getBoundingClientRect(),
          before = root.scrollTop;
        if (lastPointer.clientY < rect.top + 65) root.scrollTop -= 18;
        else if (lastPointer.clientY > rect.bottom - 65) root.scrollTop += 18;
        if (before !== root.scrollTop) {
          const match = targetAt(lastPointer);
          clear();
          if (match) {
            indicated = match.target;
            indicated.dataset.workspaceDrop = match.after ? "after" : "before";
          }
        }
      }
      scrollFrame = requestAnimationFrame(autoScroll);
    };
    const pointerEnd = (event: PointerEvent) => {
      const drag = pointer.current;
      pointer.current = null;
      stopScroll();
      clear();
      if (!drag?.active) return;
      event.preventDefault();
      suppressClick.current = Date.now() + 400;
      const match = targetAt(event);
      if (match) {
        place(drag.payload, match);
        const root = element.closest<HTMLElement>("[data-workspace-scroll]"),
          top = root?.scrollTop;
        editor.focus();
        if (root && top !== undefined) root.scrollTop = top;
      }
    };
    const cancel = () => {
      if (pointer.current?.active) suppressClick.current = Date.now() + 400;
      pointer.current = null;
      stopScroll();
      clear();
    };
    const click = (event: MouseEvent) => {
      if (Date.now() < suppressClick.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const nativeStart = (event: DragEvent) => {
      if (pointer.current) event.preventDefault();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
    };
    const over = (event: DragEvent) => {
      if (
        !editor.isEditable ||
        !event.dataTransfer?.types.includes(workspaceDragType)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      const match = targetAt(event);
      clear();
      if (match) {
        indicated = match.target;
        indicated.dataset.workspaceDrop = match.after ? "after" : "before";
      }
      const root = element.closest<HTMLElement>("[data-workspace-scroll]");
      if (root) {
        const rect = root.getBoundingClientRect();
        if (event.clientY < rect.top + 60) root.scrollTop -= 18;
        else if (event.clientY > rect.bottom - 60) root.scrollTop += 18;
      }
    };
    const drop = (event: DragEvent) => {
      const raw = event.dataTransfer?.getData(workspaceDragType);
      if (!raw || !editor.isEditable) return;
      event.preventDefault();
      event.stopPropagation();
      clear();
      const match = targetAt(event);
      if (!match) return;
      try {
        const payload: { blockId?: string; pageId?: string } = JSON.parse(raw);
        place(payload, match);
      } catch (reason) {
        onError(
          reason instanceof Error
            ? reason.message
            : "Chưa di chuyển được khối.",
        );
      }
      editor.getExtension(SideMenuExtension)?.blockDragEnd();
    };
    element.addEventListener("dragover", over, true);
    element.addEventListener("drop", drop, true);
    element.addEventListener("dragleave", clear);
    window.addEventListener("dragend", clear);
    window.addEventListener("pointermove", pointerMove, { passive: false });
    window.addEventListener("pointerup", pointerEnd);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("click", click, true);
    window.addEventListener("dragstart", nativeStart, true);
    window.addEventListener("keydown", escape);
    return () => {
      stopScroll();
      clear();
      element.removeEventListener("dragover", over, true);
      element.removeEventListener("drop", drop, true);
      element.removeEventListener("dragleave", clear);
      window.removeEventListener("dragend", clear);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerEnd);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("click", click, true);
      window.removeEventListener("dragstart", nativeStart, true);
      window.removeEventListener("keydown", escape);
    };
  }, [editor, pages, pageId, onError]);
  return { host, startPointerDrag };
}
