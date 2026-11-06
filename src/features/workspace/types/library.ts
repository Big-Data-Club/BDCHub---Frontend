export type LibraryTab = "recent" | "favorites" | "shared" | "private" | "all";
export type LibraryColumn =
  | "title"
  | "creator"
  | "source"
  | "created"
  | "editor"
  | "edited"
  | "visited";
export type LibraryFilterField = Exclude<LibraryColumn, "source">;
export type LibraryOperator =
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "eq"
  | "not_eq"
  | "on"
  | "before"
  | "after"
  | "on_or_before"
  | "on_or_after"
  | "past_week"
  | "past_month"
  | "empty"
  | "not_empty";
export interface LibraryFilter {
  id: string;
  field: LibraryFilterField;
  op: LibraryOperator;
  value?: string;
}
export interface LibraryPreferences {
  columns: LibraryColumn[];
  hidden: LibraryColumn[];
  sort: LibraryColumn;
  direction: "asc" | "desc";
  filters: LibraryFilter[];
  match: "all" | "any";
}
export interface LibraryQuery {
  tab: LibraryTab;
  q: string;
  sort: LibraryColumn;
  direction: "asc" | "desc";
  filters: Omit<LibraryFilter, "id">[];
  match: "all" | "any";
  timezone: string;
  offset?: number;
  parent?: string;
}
export interface LibrarySource {
  kind: "page" | "field" | "space" | "private" | "shared";
  title: string;
  id?: string;
  icon?: string;
  space_id?: string;
}
export interface LibraryPage {
  id: string;
  title: string;
  icon: string;
  kind: "page" | "database" | "record";
  created_at: string;
  updated_at: string;
  opened_at: string | null;
  created_by: string;
  updated_by: string;
  creator_name: string;
  last_editor: string;
  favorite: boolean;
  shared: boolean;
  private: boolean;
  access: number;
  space_id: string | null;
  field_id: string | null;
  parent_id: string | null;
  source: LibrarySource;
  has_children: boolean;
}
export interface LibraryResult {
  items: LibraryPage[];
  total: number;
  next_offset: number | null;
}
export interface LibraryPeople {
  creators: { id: string; name: string }[];
  editors: { id: string; name: string }[];
}
export interface LibraryChildren extends LibraryResult {
  loading: boolean;
  error: string;
}
