export type WorkspaceRole =
  | "viewer"
  | "commenter"
  | "editor"
  | "manager"
  | "owner";
export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
}
export interface WorkspaceSpace {
  id: string;
  title: string;
  kind: "personal" | "team";
  owner_id: string;
  role: WorkspaceRole;
}
export interface WorkspaceSource {
  type: "course" | "lab" | "task" | "url" | "notebook" | "studio";
  id?: string;
  label: string;
  url?: string;
}
export interface WorkspacePage {
  id: string;
  space_id: string;
  parent_id: string | null;
  title: string;
  icon: string;
  cover: "" | "blue" | "violet" | "green" | "amber" | "rose" | "slate";
  full_width: boolean;
  kind: "page" | "database" | "record";
  properties: Record<string, PropertyValue>;
  sources: WorkspaceSource[];
  version: number;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  favorite?: boolean;
  opened_at?: string;
  access?: number;
  generation?: number;
  revision?: string;
  initial_markdown?: string;
  space_role?: WorkspaceRole | null;
  computed?: Record<string, PropertyValue | { error: string }>;
}
export type PropertyValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | { start: string; end?: string };
export interface WorkspaceInvite {
  id: string;
  title: string;
  role: WorkspaceRole;
  sender: string;
  page_id: string | null;
  space_id: string | null;
}
export interface WorkspaceBootstrap {
  user: WorkspaceUser;
  spaces: WorkspaceSpace[];
  shared_pages: Pick<WorkspacePage, "id" | "title" | "icon" | "space_id">[];
  invitations: WorkspaceInvite[];
}
export interface FieldOption {
  id: string;
  label: string;
  color?: "blue" | "green" | "amber" | "rose" | "violet" | "slate";
}
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "status"
  | "multi_select"
  | "person"
  | "date"
  | "checkbox"
  | "url"
  | "relation"
  | "formula"
  | "rollup";
export interface DatabaseField {
  id: string;
  name: string;
  type: FieldType;
  options?: FieldOption[];
  formula?: string;
  relation_page_id?: string;
  relation_field_id?: string;
  target_field_id?: string;
  aggregate?: "count" | "sum" | "avg" | "min" | "max";
}
export type ViewType =
  | "table"
  | "board"
  | "calendar"
  | "list"
  | "gallery"
  | "timeline";
export interface ViewFilter {
  field: string;
  op: "eq" | "contains" | "empty" | "not_empty" | "gte" | "lte";
  value?: string | number | boolean;
}
export interface DatabaseViewConfig {
  group_by?: string;
  date_field?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  visible_fields?: string[];
  filters?: ViewFilter[];
}
export interface DatabaseView {
  id: string;
  page_id: string;
  owner_id: string | null;
  name: string;
  type: ViewType;
  config: DatabaseViewConfig;
  version: number;
}
export interface WorkspaceDatabase {
  fields: DatabaseField[];
  version: number;
  views: DatabaseView[];
  records: WorkspacePage[];
  next_cursor: string | null;
  access: number;
}
export interface WorkspaceMember extends WorkspaceUser {
  role: WorkspaceRole;
  source?: "space" | "page";
}
export interface WorkspaceSharing {
  members: WorkspaceMember[];
  pending: {
    id: string;
    email: string;
    role: WorkspaceRole;
    expires_at: string;
  }[];
  access: number;
}
export interface WorkspaceComment {
  id: string;
  page_id: string;
  block_id: string | null;
  parent_id: string | null;
  author_id: string;
  author_name: string;
  body: string;
  resolved: boolean;
  created_at: string;
}
export interface WorkspaceVersion {
  id: string;
  title: string;
  label: string;
  author: string;
  created_at: string;
}
export interface WorkspaceActivity {
  id: string;
  action: string;
  actor: string;
  created_at: string;
}
export interface WorkspaceDocument {
  state: string;
  generation: number;
  revision: string;
}
export interface WorkspaceFile {
  id: string;
  name: string;
  mime: string;
  url: string;
}
export type SaveState =
  | "connecting"
  | "saved"
  | "saving"
  | "offline"
  | "readonly"
  | "revoked"
  | "restored"
  | "error";
export interface CollaborationStatus {
  state: SaveState;
  pending: number;
  message?: string;
  access: number;
}
export interface FormulaInsert {
  source: string;
  mode: "inline" | "block";
}
export interface EditorActions {
  insertMath: (formula: FormulaInsert) => void;
  insertMarkdown: (markdown: string) => Promise<void>;
  exportMarkdown: () => Promise<string>;
  exportJson: () => string;
  selectionText: () => string;
  insertPageLink: (page: WorkspacePage) => void;
  focus: () => void;
}
