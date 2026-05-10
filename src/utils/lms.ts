export function formatCourseLevel(level: string): string {
  const levels: Record<string, string> = {
    BEGINNER: "Cơ bản",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Nâng cao",
  };
  return levels[level] || level;
}

export function formatCourseStatus(status: string): string {
  const statuses: Record<string, string> = {
    DRAFT: "Nháp",
    PUBLISHED: "Đã xuất bản",
    ARCHIVED: "Lưu trữ",
  };
  return statuses[status] || status;
}

export function formatEnrollmentStatus(status: string): string {
  const statuses: Record<string, string> = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    DROPPED: "Đã hủy",
    COMPLETED: "Hoàn thành",
  };
  return statuses[status] || status;
}

export function getEnrollmentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    APPROVED: "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    REJECTED: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    DROPPED: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    COMPLETED: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  };
  return colors[status] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function isDeadlineSoon(deadline: string, hoursThreshold: number = 24): boolean {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours <= hoursThreshold && diffHours > 0;
}

export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date();
}
