import { TaskResponse } from "@/services/taskService";

export type ViewMode = "day" | "week" | "month";

export type TaskWithColor = TaskResponse & {
  color: string;
  eventName?: string;
  status: "todo" | "in-progress" | "done" | "cancel";
};

export interface TaskRow {
  task: TaskWithColor;
  startIdx: number;
  endIdx: number;
  span: number;
}

export interface SpanInfo {
  isStart: boolean;
  isEnd: boolean;
}

export const PRIORITY_CONFIG = {
  LOW:      { dot: "bg-green-500",  label: "Low" },
  MEDIUM:   { dot: "bg-yellow-500", label: "Medium" },
  HIGH:     { dot: "bg-orange-500", label: "High" },
  CRITICAL: { dot: "bg-red-500",    label: "Critical" },
} as const;

export const STATUS_CONFIG = {
  "todo":        { label: "To Do",       dot: "bg-slate-400"  },
  "in-progress": { label: "In Progress", dot: "bg-blue-500"   },
  "done":        { label: "Done",        dot: "bg-green-500"  },
  "cancel":      { label: "Cancelled",   dot: "bg-red-400"    },
} as const;

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;