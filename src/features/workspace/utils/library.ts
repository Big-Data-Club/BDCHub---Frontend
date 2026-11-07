import type {
  LibraryColumn,
  LibraryFilter,
  LibraryFilterField,
  LibraryOperator,
  LibraryPreferences,
  LibraryTab,
} from "../types/library";
export const libraryTabs: { id: LibraryTab; label: string }[] = [
  { id: "recent", label: "Gần đây" },
  { id: "favorites", label: "Yêu thích" },
  { id: "shared", label: "Được chia sẻ" },
  { id: "private", label: "Riêng tư" },
  { id: "all", label: "Tất cả" },
];
export const libraryColumns: { id: LibraryColumn; label: string }[] = [
  { id: "title", label: "Tên trang" },
  { id: "creator", label: "Người tạo" },
  { id: "source", label: "Nguồn" },
  { id: "edited", label: "Sửa gần nhất" },
  { id: "visited", label: "Truy cập gần nhất" },
  { id: "created", label: "Ngày tạo" },
  { id: "editor", label: "Người sửa gần nhất" },
];
export const dateFields: LibraryFilterField[] = [
  "created",
  "edited",
  "visited",
];
const operatorLabels: Record<LibraryOperator, string> = {
  contains: "Có chứa",
  not_contains: "Không chứa",
  starts_with: "Bắt đầu bằng",
  ends_with: "Kết thúc bằng",
  eq: "Là",
  not_eq: "Không phải",
  on: "Vào ngày",
  before: "Trước ngày",
  after: "Sau ngày",
  on_or_before: "Vào hoặc trước",
  on_or_after: "Vào hoặc sau",
  past_week: "Trong 7 ngày qua",
  past_month: "Trong 30 ngày qua",
  empty: "Chưa có",
  not_empty: "Đã có",
};
export const unaryOperators: LibraryOperator[] = [
  "past_week",
  "past_month",
  "empty",
  "not_empty",
];
export function operatorsFor(field: LibraryFilterField) {
  const values: LibraryOperator[] =
    field === "title"
      ? ["contains", "not_contains", "starts_with", "ends_with", "eq", "not_eq"]
      : dateFields.includes(field)
        ? [
            "on",
            "before",
            "after",
            "on_or_before",
            "on_or_after",
            "past_week",
            "past_month",
            "empty",
            "not_empty",
          ]
        : ["eq", "not_eq"];
  return values.map((id) => ({ id, label: operatorLabels[id] }));
}
export function readyFilter(rule: LibraryFilter) {
  if (!operatorsFor(rule.field).some((item) => item.id === rule.op))
    return false;
  if (unaryOperators.includes(rule.op)) return true;
  if (!rule.value?.trim() || rule.value.length > 200) return false;
  return (
    !dateFields.includes(rule.field) ||
    (/^\d{4}-\d{2}-\d{2}$/.test(rule.value) &&
      !rule.value.startsWith("0000-") &&
      Number.isFinite(Date.parse(rule.value)) &&
      new Date(rule.value).toISOString().slice(0, 10) === rule.value)
  );
}
export function defaultLibraryPreferences(tab: LibraryTab): LibraryPreferences {
  return {
    columns: libraryColumns.map((item) => item.id),
    hidden: ["created", "editor"],
    sort: tab === "recent" ? "visited" : "edited",
    direction: "desc",
    filters: [],
    match: "all",
  };
}
export function parseLibraryPreferences(
  raw: unknown,
  tab: LibraryTab,
): LibraryPreferences {
  const fallback = defaultLibraryPreferences(tab);
  if (!raw || typeof raw !== "object") return fallback;
  const input = raw as Partial<LibraryPreferences>,
    keys = new Set(libraryColumns.map((item) => item.id));
  const columns = [
    "title" as const,
    ...new Set(
      (Array.isArray(input.columns) ? input.columns : []).filter(
        (id) => keys.has(id) && id !== "title",
      ),
    ),
  ];
  for (const { id } of libraryColumns)
    if (!columns.includes(id)) columns.push(id);
  const filters: LibraryFilter[] = [];
  for (const rule of Array.isArray(input.filters)
    ? input.filters.slice(0, 12)
    : []) {
    if (
      !rule ||
      !libraryColumns
        .filter((item) => item.id !== "source")
        .some((item) => item.id === rule.field) ||
      !operatorsFor(rule.field).some((item) => item.id === rule.op)
    )
      continue;
    filters.push({
      id: typeof rule.id === "string" ? rule.id : crypto.randomUUID(),
      field: rule.field,
      op: rule.op,
      value: typeof rule.value === "string" ? rule.value.slice(0, 200) : "",
    });
  }
  return {
    columns,
    hidden: Array.isArray(input.hidden)
      ? [
          ...new Set(
            input.hidden.filter((id) => keys.has(id) && id !== "title"),
          ),
        ]
      : fallback.hidden,
    sort: keys.has(input.sort!) ? input.sort! : fallback.sort,
    direction: input.direction === "asc" ? "asc" : "desc",
    filters,
    match: input.match === "any" ? "any" : "all",
  };
}
export function reorderLibraryColumn(
  columns: LibraryColumn[],
  from: LibraryColumn,
  to: LibraryColumn,
) {
  if (
    from === "title" ||
    to === "title" ||
    !columns.includes(from) ||
    !columns.includes(to)
  )
    return columns;
  const result = columns.filter((id) => id !== from);
  result.splice(columns.indexOf(to), 0, from);
  return result;
}
export function libraryTime(value: string | null, now: number) {
  if (!value) return "Chưa mở";
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "—";
  const minutes = Math.round((time - now) / 60000);
  if (Math.abs(minutes) < 1) return "Vừa xong";
  if (Math.abs(minutes) < 60)
    return new Intl.RelativeTimeFormat("vi", { numeric: "auto" }).format(
      minutes,
      "minute",
    );
  if (Math.abs(minutes) < 1440)
    return new Intl.RelativeTimeFormat("vi", { numeric: "auto" }).format(
      Math.round(minutes / 60),
      "hour",
    );
  if (Math.abs(minutes) < 10080)
    return new Intl.RelativeTimeFormat("vi", { numeric: "auto" }).format(
      Math.round(minutes / 1440),
      "day",
    );
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(time);
}
