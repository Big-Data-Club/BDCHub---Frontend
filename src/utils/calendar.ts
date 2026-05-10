import { ViewMode, TaskWithColor, TaskRow, SpanInfo, MONTH_NAMES } from "@/types";

export function parseDate(val: string | Date | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  return new Date(val);
}

export function toMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDaysInView(date: Date, mode: ViewMode): Date[] {
  if (mode === "day") return [date];

  if (mode === "week") {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  // month
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function getCalendarTitle(date: Date, mode: ViewMode): string {
  if (mode === "day") {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  if (mode === "week") {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${date.getFullYear()}`;
  }
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function navigate(date: Date, mode: ViewMode, dir: 1 | -1): Date {
  const next = new Date(date);
  if (mode === "day")   next.setDate(date.getDate() + dir);
  if (mode === "week")  next.setDate(date.getDate() + dir * 7);
  if (mode === "month") next.setMonth(date.getMonth() + dir);
  return next;
}

export function getTasksForDay(tasks: TaskWithColor[], day: Date): TaskWithColor[] {
  const dayMs = toMidnight(day).getTime();
  return tasks.filter(t => {
    const start = parseDate(t.startDate);
    const end   = parseDate(t.endDate);
    if (!start || !end) return false;
    return dayMs >= toMidnight(start).getTime() && dayMs <= toMidnight(end).getTime();
  });
}

export function getSpanInfo(task: TaskWithColor, day: Date): SpanInfo {
  const start = parseDate(task.startDate);
  const end   = parseDate(task.endDate);
  if (!start || !end) return { isStart: false, isEnd: false };
  const d = toMidnight(day).getTime();
  return {
    isStart: toMidnight(start).getTime() === d,
    isEnd:   toMidnight(end).getTime()   === d,
  };
}

export function buildTaskRows(tasks: TaskWithColor[], days: Date[]): TaskRow[] {
  const rows: TaskRow[] = [];
  const placed = new Set<number>();

  days.forEach(day => {
    getTasksForDay(tasks, day).forEach(task => {
      if (placed.has(task.id as number)) return;
      const start = parseDate(task.startDate);
      const end   = parseDate(task.endDate);
      if (!start || !end) return;
      if (toMidnight(start).getTime() !== toMidnight(day).getTime()) return;

      const startIdx = days.findIndex(d => toMidnight(d).getTime() === toMidnight(start).getTime());
      const endIdx   = days.findIndex(d => toMidnight(d).getTime() === toMidnight(end).getTime());
      if (startIdx < 0 || endIdx < 0) return;

      rows.push({ task, startIdx, endIdx, span: endIdx - startIdx + 1 });
      placed.add(task.id as number);
    });
  });
  return rows;
}

export function formatShort(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
}

export function formatDateTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleString("vi-VN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}