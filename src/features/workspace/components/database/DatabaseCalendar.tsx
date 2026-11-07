"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { RecordViewProps } from "./DatabaseRows";
import { dateValue, isoDate, moveDate } from "../../utils/databaseViews";
import { WorkspaceButton, WorkspaceErrorBanner } from "../WorkspacePrimitives";

export function DatabaseCalendar({
  records,
  fields,
  editable,
  onOpen,
  onUpdate,
  dateField,
  onNew,
}: RecordViewProps & {
  dateField?: string;
  onNew: (values: Record<string, { start: string }>) => void;
}) {
  const [month, setMonth] = useState(
      () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    [error, setError] = useState<string | null>(null);
  const field =
    fields.find((item) => item.id === dateField && item.type === "date") ||
    fields.find((item) => item.type === "date");
  if (!field)
    return (
      <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
        Thêm thuộc tính Ngày để dùng lịch.
      </p>
    );
  const start = new Date(month);
  start.setDate(1 - ((month.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  const unplanned = records.filter(
    (record) => !dateValue(record.properties[field.id]),
  );
  async function drop(id: string, day: string) {
    const record = records.find((item) => item.id === id);
    if (!record || !editable) return;
    try {
      await onUpdate(record, {
        [field!.id]: moveDate(record.properties[field!.id], day),
      });
      setError(null);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa đổi được ngày.",
      );
    }
  }
  return (
    <div className="space-y-4">
      <WorkspaceErrorBanner message={error} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold capitalize">
          {month.toLocaleDateString("vi-VN", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="flex gap-1">
          <WorkspaceButton
            aria-label="Tháng trước"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            <ChevronLeft className="size-4" />
          </WorkspaceButton>
          <WorkspaceButton
            onClick={() =>
              setMonth(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              )
            }
          >
            Hôm nay
          </WorkspaceButton>
          <WorkspaceButton
            aria-label="Tháng sau"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            <ChevronRight className="size-4" />
          </WorkspaceButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px] overflow-hidden rounded-xl border border-slate-200 dark:border-lms-border">
          <div className="grid grid-cols-7 bg-slate-50 text-center text-xs text-slate-500 dark:bg-lms-input dark:text-slate-400">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <div key={day} className="py-3">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const iso = isoDate(day),
                items = records.filter((record) => {
                  const date = dateValue(record.properties[field.id]);
                  return (
                    date && date.start <= iso && (date.end || date.start) >= iso
                  );
                });
              return (
                <section
                  key={iso}
                  aria-label={day.toLocaleDateString("vi-VN")}
                  className={`min-h-28 min-w-0 border-t border-r border-slate-200 p-2 dark:border-lms-border ${day.getMonth() === month.getMonth() ? "" : "bg-slate-50/60 dark:bg-lms-input/40"}`}
                  onDragOver={(event) => {
                    if (editable) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void drop(
                      event.dataTransfer.getData("application/x-bdc-record"),
                      iso,
                    );
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`text-xs ${iso === isoDate(new Date()) ? "font-bold text-blue-600 dark:text-cyan-300" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {day.getDate()}
                    </span>
                    {editable && (
                      <button
                        type="button"
                        aria-label={`Thêm mục ngày ${iso}`}
                        onClick={() => onNew({ [field.id]: { start: iso } })}
                        className="rounded p-1 transition-all active:scale-95"
                      >
                        <Plus className="size-3" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {items.map((record) => (
                      <button
                        key={record.id}
                        type="button"
                        draggable={editable}
                        onDragStart={(event) =>
                          event.dataTransfer.setData(
                            "application/x-bdc-record",
                            record.id,
                          )
                        }
                        className="block w-full truncate rounded-md bg-blue-50 px-2 py-1 text-left text-xs text-blue-700 transition-all active:scale-95 dark:bg-blue-500/15 dark:text-cyan-300"
                        onClick={() => onOpen(record.id)}
                      >
                        {record.title}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
      {unplanned.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm text-slate-500 dark:text-slate-400">
            Chưa có ngày · {unplanned.length}
          </h4>
          <div className="flex flex-wrap gap-2">
            {unplanned.map((record) => (
              <WorkspaceButton
                key={record.id}
                onClick={() => onOpen(record.id)}
              >
                {record.title}
              </WorkspaceButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
