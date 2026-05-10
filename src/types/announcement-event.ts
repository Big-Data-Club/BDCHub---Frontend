import { Task } from "./task";

// ─── Announcement ───────────────────────────────────────────────────────────

export type Announcement = {
  id: number;
  title: string;
  content: string;
  images: string[];
  status: "PENDING" | "APPROVED" | "DENIED" | "EXPIRED";
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  type: "INFO" | "WARNING" | "URGENT";
  target: "ALL" | "STUDENT" | "LECTURER";
  createdAt: string;
}

export const ANNOUNCEMENT_STATUSES = ["PENDING", "APPROVED", "DENIED", "EXPIRED"];

export const STATUS_COLORS = {
  PENDING: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
  IN_PROGRESS: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  COMPLETED: "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  POSTPONED: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  APPROVED: "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  DENIED: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  EXPIRED: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
};

// ─── Event ───────────────────────────────────────────────────────────────────

export type EventItem = {
  id: number;
  title: string;
  description: string;
  statusEvent: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "POSTPONED";
  startTime?: string;
  endTime?: string;
  capacity?: number;
  createdAt?: string;
  updatedAt?: string;
  tasks?: Task[];
};

export type MockEvent = {
  id: number | string;
  text: string;
  start: string;
  end: string;
  backColor?: string;
  participants?: string[];
  ownerId?: string;
  tasks?: Task[];
};

export const EVENT_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "POSTPONED"] as const;
