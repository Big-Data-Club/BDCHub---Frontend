import type {
  PageAnalytics,
  WorkspaceField,
  FieldInput,
  DatabaseField,
  DatabaseView,
  DatabaseViewConfig,
  ViewType,
  WorkspaceActivity,
  WorkspaceBootstrap,
  WorkspaceComment,
  WorkspaceDatabase,
  WorkspaceDocument,
  WorkspaceFile,
  WorkspaceMember,
  WorkspacePage,
  WorkspaceRole,
  WorkspaceSharing,
  WorkspaceVersion,
  PropertyValue,
} from "../types";

export class WorkspaceError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/workspace${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    signal,
    headers:
      body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!response.ok)
    throw new WorkspaceError(
      data.error || "Chưa thể hoàn thành thao tác. Vui lòng thử lại.",
      response.status,
      data.code,
    );
  return data as T;
}
export const workspaceService = {
  linkedTasks: (pageId: string) =>
    request<import("./linkedTasks.server").LinkedTask[]>(
      `/pages/${pageId}/tasks`,
    ),
  bootstrap: () => request<WorkspaceBootstrap>("/bootstrap"),
  fields: (spaceId: string, archived = false) =>
    request<WorkspaceField[]>(`/spaces/${spaceId}/fields?archived=${archived}`),
  field: (id: string) => request<WorkspaceField>(`/fields/${id}`),
  createField: (spaceId: string, input: FieldInput) =>
    request<WorkspaceField>(`/spaces/${spaceId}/fields`, "POST", input),
  updateField: (id: string, input: Partial<FieldInput> & { version: number }) =>
    request<WorkspaceField>(`/fields/${id}`, "PATCH", input),
  archiveField: (id: string) => request(`/fields/${id}/archive`, "POST", {}),
  restoreField: (id: string) => request(`/fields/${id}/restore`, "POST", {}),
  blockActivity: (pageId: string, blockId: string, signal?: AbortSignal) =>
    request<{ author: string; updated_at: string } | null>(
      `/pages/${pageId}/blocks/${encodeURIComponent(blockId)}/activity`,
      "GET",
      undefined,
      signal,
    ),
  tabPages: (query: string, fieldId: string, signal?: AbortSignal) =>
    request<
      (Pick<
        WorkspacePage,
        "id" | "title" | "icon" | "space_id" | "field_id"
      > & { snippet: string; updated_at: string })[]
    >(
      `/tab-pages?${new URLSearchParams({ q: query, ...(fieldId ? { field: fieldId } : {}) })}`,
      "GET",
      undefined,
      signal,
    ),
  notifications: () =>
    request<{ id: string; page_id: string; title: string; kind: string }[]>(
      "/notifications",
    ),
  readNotification: (id: string) =>
    request(`/notifications/${id}/read`, "POST", {}),
  createSpace: (title: string) =>
    request<{ id: string }>("/spaces", "POST", { title }),
  async capture(
    title: string,
    markdown: string,
    sources: WorkspacePage["sources"],
  ) {
    const home = await request<WorkspaceBootstrap>("/bootstrap");
    const space = home.spaces.find((item) => item.kind === "personal");
    if (!space) throw Error("Chưa mở được không gian cá nhân.");
    return request<WorkspacePage>(`/spaces/${space.id}/pages`, "POST", {
      title: title.slice(0, 300) || "Ghi chú",
      markdown,
      sources,
    });
  },
  profile: (name: string) => request("/me", "PATCH", { name }),
  pages: (spaceId: string, archived = false) =>
    request<WorkspacePage[]>(`/spaces/${spaceId}/pages?archived=${archived}`),
  page: (id: string) => request<WorkspacePage>(`/pages/${id}`),
  recordView: (id: string) =>
    request<{ counted: boolean }>(`/pages/${id}/view`, "POST", {}),
  analytics: (id: string, days: number, signal?: AbortSignal) =>
    request<PageAnalytics>(
      `/pages/${id}/analytics?days=${days}`,
      "GET",
      undefined,
      signal,
    ),
  viewPreference: (id: string, show_name: boolean) =>
    request(`/pages/${id}/view-preference`, "PATCH", { show_name }),
  createPage: (
    spaceId: string,
    input: {
      title: string;
      parent_id?: string | null;
      field_id?: string | null;
      kind?: "page" | "database";
      template?: string;
      sources?: WorkspacePage["sources"];
    },
  ) => request<WorkspacePage>(`/spaces/${spaceId}/pages`, "POST", input),
  updatePage: (
    id: string,
    input: Partial<
      Pick<
        WorkspacePage,
        | "title"
        | "icon"
        | "cover"
        | "full_width"
        | "parent_id"
        | "field_id"
        | "sort_order"
        | "sources"
      >
    > & { version: number },
  ) => request<WorkspacePage>(`/pages/${id}`, "PATCH", input),
  archive: (id: string) => request(`/pages/${id}/archive`, "POST", {}),
  restore: (id: string) => request(`/pages/${id}/restore`, "POST", {}),
  duplicate: (id: string) =>
    request<WorkspacePage>(`/pages/${id}/duplicate`, "POST", {}),
  favorite: (id: string, favorite: boolean) =>
    request(`/pages/${id}/favorite`, "PUT", { favorite }),
  search: (query: string, signal?: AbortSignal) =>
    request<
      (Pick<
        WorkspacePage,
        "id" | "title" | "icon" | "space_id" | "field_id"
      > & {
        snippet: string;
      })[]
    >(`/search?q=${encodeURIComponent(query)}`, "GET", undefined, signal),
  document: (id: string) => request<WorkspaceDocument>(`/pages/${id}/document`),
  initialize: (id: string, update: string, generation: number) =>
    request(`/pages/${id}/initialize`, "POST", {
      update,
      generation,
      operation_id: crypto.randomUUID(),
    }),
  ticket: (id: string) =>
    request<{ ticket: string }>(`/pages/${id}/ticket`, "POST", {}),
  sharing: (id: string) => request<WorkspaceSharing>(`/pages/${id}/sharing`),
  members: (spaceId: string) =>
    request<WorkspaceMember[]>(`/spaces/${spaceId}/members`),
  invite: (input: {
    page_id?: string;
    space_id?: string;
    email: string;
    role: WorkspaceRole;
  }) => request("/invitations", "POST", input),
  respond: (id: string, action: "accept" | "decline") =>
    request(`/invitations/${id}/respond`, "POST", { action }),
  cancelInvite: (id: string) => request(`/invitations/${id}`, "DELETE"),
  grant: (input: {
    page_id?: string;
    space_id?: string;
    member_id: string;
    role: WorkspaceRole | null;
  }) => request("/grants", "PATCH", input),
  comments: (id: string) =>
    request<WorkspaceComment[]>(`/pages/${id}/comments`),
  comment: (
    id: string,
    body: string,
    blockId?: string,
    parentId?: string,
    mentions: string[] = [],
  ) =>
    request(`/pages/${id}/comments`, "POST", {
      body,
      block_id: blockId || null,
      parent_id: parentId || null,
      mentions,
    }),
  changeComment: (
    id: string,
    input: { body?: string; resolved?: boolean; delete?: boolean },
  ) => request(`/comments/${id}`, "PATCH", input),
  versions: (id: string) =>
    request<WorkspaceVersion[]>(`/pages/${id}/versions`),
  snapshot: (id: string, label: string) =>
    request(`/pages/${id}/versions`, "POST", { label }),
  restoreVersion: (id: string, versionId: string) =>
    request(`/pages/${id}/versions/${versionId}/restore`, "POST", {}),
  activity: (id: string) =>
    request<WorkspaceActivity[]>(`/pages/${id}/activity`),
  references: (id: string) =>
    request<{
      sources: WorkspacePage["sources"];
      backlinks: Pick<WorkspacePage, "id" | "title" | "icon">[];
    }>(`/pages/${id}/references`),
  database: (id: string, cursor?: string) =>
    request<WorkspaceDatabase>(
      `/databases/${id}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
    ),
  schema: (id: string, fields: DatabaseField[], version: number) =>
    request(`/databases/${id}/schema`, "PUT", { fields, version }),
  createRecord: (
    id: string,
    title: string,
    values: Record<string, PropertyValue> = {},
  ) =>
    request<WorkspacePage>(`/databases/${id}/records`, "POST", {
      title,
      values,
    }),
  updateRecord: (
    id: string,
    version: number,
    values: Record<string, PropertyValue>,
    title?: string,
  ) =>
    request<WorkspacePage>(`/records/${id}`, "PATCH", {
      version,
      values,
      ...(title ? { title } : {}),
    }),
  createView: (
    id: string,
    name: string,
    type: ViewType,
    config: DatabaseViewConfig,
    personal: boolean,
  ) =>
    request<DatabaseView>(`/databases/${id}/views`, "POST", {
      name,
      type,
      config,
      personal,
    }),
  saveView: (id: string, view: DatabaseView) =>
    request<DatabaseView>(`/databases/${id}/views/${view.id}`, "PUT", {
      version: view.version,
      view: {
        name: view.name,
        type: view.type,
        config: view.config,
        personal: Boolean(view.owner_id),
      },
    }),
  legacyNotes: () =>
    request<
      { id: string; title: string; content: string; course_id?: number }[]
    >("/legacy-notes"),
  importLegacy: (noteId: string) =>
    request<WorkspacePage>("/legacy-notes", "POST", { note_id: noteId }),
  async upload(pageId: string, file: File): Promise<WorkspaceFile> {
    const response = await fetch(`/api/workspace/pages/${pageId}/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
      },
      body: file,
      credentials: "same-origin",
    });
    const result = await response.json();
    if (!response.ok)
      throw new WorkspaceError(
        result.error || "Chưa tải được tệp.",
        response.status,
      );
    return result;
  },
  async askAi(
    pageId: string,
    prompt: string,
    selection: string,
    onText: (text: string) => void,
    signal: AbortSignal,
  ) {
    const response = await fetch(`/api/workspace/pages/${pageId}/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, selection }),
      signal,
    });
    if (!response.ok || !response.body)
      throw new WorkspaceError(
        "Chưa kết nối được AI. Bạn có thể thử lại.",
        response.status,
      );
    const reader = response.body.getReader(),
      decoder = new TextDecoder();
    let buffer = "",
      output = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const event = JSON.parse(line.slice(5).trim()) as {
            type?: string;
            content?: string;
            text?: string;
            token?: string;
            message?: string;
            data?: { delta?: string; message?: string };
          };
          if (event.type === "error")
            throw new WorkspaceError(
              event.data?.message ||
                event.message ||
                "AI chưa hoàn thành câu trả lời.",
              502,
            );
          if (event.type === "text_reset") {
            output = "";
            onText(output);
          }
          if (event.type === "text_delta") {
            output += event.data?.delta || "";
            onText(output);
          }
          if (
            ["token", "content", "text", "chunk"].includes(event.type || "")
          ) {
            output += event.content || event.text || event.token || "";
            onText(output);
          }
        } catch (error) {
          if (error instanceof WorkspaceError) throw error;
        }
      }
    }
    return output;
  },
};
