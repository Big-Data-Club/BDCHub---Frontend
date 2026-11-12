import type {
  DatabaseField,
  DatabaseViewConfig,
  PropertyValue,
  WorkspacePage,
} from "../types";
export function propertyText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    if ("error" in value) return String(value.error);
    if ("start" in value)
      return `${value.start}${"end" in value && value.end ? ` → ${value.end}` : ""}`;
    return "";
  }
  return String(value);
}
export function recordValue(record: WorkspacePage, field: string): unknown {
  return field === "title"
    ? record.title
    : record.computed && field in record.computed
      ? record.computed[field]
      : record.properties[field];
}
export function visibleRecords(
  records: WorkspacePage[],
  fields: DatabaseField[],
  config: DatabaseViewConfig,
  query: string,
) {
  const valueLabel = (record: WorkspacePage, fieldId: string) => {
    const value = recordValue(record, fieldId),
      field = fields.find((item) => item.id === fieldId);
    return (
      field?.options?.find((option) => option.id === value)?.label ||
      propertyText(value)
    );
  };
  const result = records
    .filter(
      (record) =>
        !query.trim() ||
        `${record.title} ${fields.map((field) => valueLabel(record, field.id)).join(" ")}`
          .toLocaleLowerCase("vi")
          .includes(query.trim().toLocaleLowerCase("vi")),
    )
    .filter((record) =>
      (config.filters || []).every((filter) => {
        const value = recordValue(record, filter.field),
          text = propertyText(value);
        switch (filter.op) {
          case "empty":
            return !text;
          case "not_empty":
            return Boolean(text);
          case "contains":
            return text
              .toLocaleLowerCase()
              .includes(String(filter.value || "").toLocaleLowerCase());
          case "gte":
            return (
              value !== null &&
              value !== undefined &&
              (typeof value === "object" && "start" in value
                ? String(value.start) >= String(filter.value)
                : Number(value) >= Number(filter.value))
            );
          case "lte":
            return (
              value !== null &&
              value !== undefined &&
              (typeof value === "object" && "start" in value
                ? String(value.start) <= String(filter.value)
                : Number(value) <= Number(filter.value))
            );
          default:
            return text === String(filter.value ?? "");
        }
      }),
    );
  if (config.sort_by)
    result.sort((a, b) => {
      const left = recordValue(a, config.sort_by!),
        right = recordValue(b, config.sort_by!);
      const compared =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : propertyText(left).localeCompare(propertyText(right), "vi", {
              numeric: true,
            });
      return (config.sort_direction === "desc" ? -1 : 1) * compared;
    });
  return result;
}
export function dateValue(value: PropertyValue | undefined) {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "start" in value
    ? value
    : null;
}
export function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function moveDate(value: PropertyValue | undefined, next: string) {
  const original = dateValue(value);
  if (!original?.end) return { start: next };
  const duration = Math.round(
    (Date.parse(original.end) - Date.parse(original.start)) / 86400000,
  );
  return {
    start: next,
    end: new Date(Date.parse(next) + duration * 86400000)
      .toISOString()
      .slice(0, 10),
  };
}
