import { Clock, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/shared/BreadcrumbNav";

interface QuizHeaderProps {
  quizTitle: string;
  courseTitle: string;
  courseId: number;
  quizId: number;
  timeLeft: number | null;
  activeSaveRequests: number;
  onBack: () => void;
}

export function QuizHeader({
  quizTitle,
  courseTitle,
  courseId,
  quizId,
  timeLeft,
  activeSaveRequests,
  onBack,
}: QuizHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    { label: courseTitle || "Khóa học", href: `/lms/student/courses/${courseId}/learn` },
    { label: "Lịch sử Quiz", href: `/lms/student/courses/${courseId}/quiz/${quizId}/history` },
    { label: "Làm bài" },
  ];

  return (
    <div className="bg-white dark:bg-[#0F1E35] border-b border-slate-200 dark:border-blue-500/10 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-[#0D192E] hover:bg-slate-200 dark:hover:bg-[#162644] transition-colors"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <BreadcrumbNav items={breadcrumbItems} />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {quizTitle || "Bài kiểm tra"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Active save requests status */}
          {activeSaveRequests > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-500/20 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang lưu...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Đã lưu tự động</span>
            </div>
          )}

          {/* Countdown timer */}
          {timeLeft !== null && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border transition-colors ${
                timeLeft < 300
                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 animate-pulse"
                  : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-500/20"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
