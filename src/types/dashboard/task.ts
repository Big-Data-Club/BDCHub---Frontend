export type TaskLink = {
  id: number | string;
  url: string;
  title: string;
};

export type TaskScore = {
  id?: number;
  taskId?: number;
  taskTitle?: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  userCode?: string;
  score: number;
  applied?: boolean;
  scoredById?: number;
  scoredByName?: string;
  scoredAt?: string;
  appliedAt?: string;
  notes?: string;
};

export type Task = {
  id: number | string;
  title: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignees: (number | string)[];
  links: TaskLink[];
  startDate?: string;
  endDate?: string;
  columnId: string;
  eventId?: number | string;
  event?: {
    id: number;
    title: string;
  };
  createdAt?: string;
  createdBy?: {
    id: number;
    name: string;
    email: string;
  };
  updatedAt?: string;
  updatedBy?: {
    id: number;
    name: string;
    email: string;
  };
};

export type Column = {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
};

export interface TaskInfo {
  id: number;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  columnId?: string;
  startDate?: string;
  endDate?: string;
}

export const PRIORITY_COLORS = {
  LOW: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  MEDIUM: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  HIGH: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
  CRITICAL: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
};
