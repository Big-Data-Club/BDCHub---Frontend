"use client";
import { dateValue } from "../../utils/databaseViews";
import type { RecordViewProps } from "./DatabaseRows";
export function DatabaseTimeline({
  records,
  fields,
  onOpen,
  dateField,
}: RecordViewProps & { dateField?: string }) {
  const field =
    fields.find((item) => item.id === dateField && item.type === "date") ||
    fields.find((item) => item.type === "date");
  if (!field)
    return (
      <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
        Thêm thuộc tính Ngày để xem dòng thời gian.
      </p>
    );
  const planned = records
    .filter((record) => dateValue(record.properties[field.id]))
    .sort((a, b) =>
      dateValue(a.properties[field.id])!.start.localeCompare(
        dateValue(b.properties[field.id])!.start,
      ),
    );
  if (!planned.length)
    return (
      <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
        Các mục có ngày sẽ xuất hiện ở đây.
      </p>
    );
  const first = Date.parse(dateValue(planned[0].properties[field.id])!.start),
    last = Math.max(
      ...planned.map((record) =>
        Date.parse(
          dateValue(record.properties[field.id])!.end ||
            dateValue(record.properties[field.id])!.start,
        ),
      ),
    ),
    days = Math.max(7, Math.ceil((last - first) / 86400000) + 1);
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-lms-border">
      <div className="min-w-[700px]">
        <div className="flex border-b border-slate-200 bg-slate-50 dark:border-lms-border dark:bg-lms-input">
          <span className="w-48 shrink-0 p-3 text-sm font-medium">
            Công việc
          </span>
          <div className="flex flex-1 justify-between p-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{new Date(first).toLocaleDateString("vi-VN")}</span>
            <span>
              {new Date(first + (days - 1) * 86400000).toLocaleDateString(
                "vi-VN",
              )}
            </span>
          </div>
        </div>
        {planned.map((record) => {
          const range = dateValue(record.properties[field.id])!,
            start = Math.max(
              1,
              Math.floor((Date.parse(range.start) - first) / 86400000) + 1,
            ),
            end = Math.min(
              days + 1,
              Math.floor(
                (Date.parse(range.end || range.start) - first) / 86400000,
              ) + 2,
            );
          return (
            <div
              key={record.id}
              className="flex min-h-12 border-b border-slate-200 dark:border-lms-border"
            >
              <button
                type="button"
                className="w-48 shrink-0 truncate p-3 text-left text-sm transition-all active:scale-95"
                onClick={() => onOpen(record.id)}
              >
                {record.title}
              </button>
              <div
                className="grid flex-1 items-center px-3 py-2"
                ref={(element) => {
                  if (element)
                    element.style.gridTemplateColumns = `repeat(${days},minmax(0,1fr))`;
                }}
              >
                <button
                  type="button"
                  aria-label={`${record.title}: ${range.start} đến ${range.end || range.start}`}
                  className="min-h-7 min-w-1 truncate rounded-md bg-blue-100 px-2 text-left text-xs text-blue-800 transition-all active:scale-95 dark:bg-blue-500/25 dark:text-cyan-200"
                  ref={(element) => {
                    if (element)
                      element.style.gridColumn = `${Math.min(start, days)} / ${Math.max(Math.min(start, days) + 1, end)}`;
                  }}
                  onClick={() => onOpen(record.id)}
                >
                  {record.title}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
