import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { microLessonService, MicroLessonJob } from "@/services/microLessonService";
import { Spinner } from "@/components/lms/shared";

interface Props {
  courseId: number;
  onClose: () => void;
  onSelectJob: (jobId: number) => void;
}

export function MicroLessonHistoryModal({ courseId, onClose, onSelectJob }: Props) {
  const [jobs, setJobs] = useState<MicroLessonJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    let active = true;
    const fetchJobs = async () => {
      try {
        const data = await microLessonService.listJobs(courseId);
        if (active) {
          // Sort newest first
          setJobs(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchJobs();
    return () => { active = false; };
  }, [courseId]);

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-blue-500/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Lịch sử tạo Micro-Lesson
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Các tiến trình phân tích AI gần đây
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Spinner className="w-8 h-8 border-[3px] mb-4" />
              <p>Đang tải danh sách...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">Chưa có tiến trình tạo bài học nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 cursor-pointer transition-colors bg-white dark:bg-slate-900 hover:shadow-sm"
                >
                  <div className="flex-shrink-0">
                    {job.status === "completed" ? (
                      <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : job.status === "failed" ? (
                      <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <XCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                        Job #{job.id}
                      </p>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="truncate">
                        {job.source_file_path?.Valid ? "Từ file tài liệu" :
                         job.source_url?.Valid ? "Từ Youtube" : "Tạo tự động"}
                      </span>
                      <span>•</span>
                      <span>{job.lessons_count} bài học nháp</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
