import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

export interface ContentItem {
  id: number;
  type: "TEXT" | "VIDEO" | "IMAGE" | "DOCUMENT" | "QUIZ" | "FORUM" | "ANNOUNCEMENT" | string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  file_path?: string | null;
  file_type?: string;
  is_mandatory?: boolean;
}

export function buildFileUrl(filePath?: string | null): string {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  return `/files/${filePath}`;
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return "Không rõ";
  const units = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match?.[1] ?? "";
}

export function extractVimeoId(url: string): string {
  return url.match(/vimeo\.com\/(\d+)/)?.[1] ?? "";
}

export function CompletionBadge({ isCompleted }: { isCompleted: boolean }) {
  if (!isCompleted) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-full">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Đã hoàn thành
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300">
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export function DownloadLink({
  href, label, secondary = false, compact = false, className,
}: {
  href: string; label: string; secondary?: boolean; compact?: boolean; className?: string;
}) {
  return (
    <a
      href={href}
      download
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap",
        compact ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm",
        secondary
          ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          : "bg-blue-600 hover:bg-blue-700 text-white",
        className
      )}
    >
      <Download className="w-4 h-4" />
      {label}
    </a>
  );
}

export function ActionButton({
  onClick, label, variant = "primary",
}: {
  onClick: () => void; label: string; variant?: "primary" | "success";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-5 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-95",
        variant === "success"
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      )}
    >
      {label}
    </button>
  );
}
