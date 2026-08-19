"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { BookOpen, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import BaseModal from "@/components/lms/shared/BaseModal";
import { sectionOverviewService } from "@/services/lms/sectionOverviewService";
import type { SectionOverviewJob } from "@/types";
import { Spinner } from "@/components/lms/shared";

interface Props {
  courseId: number;
  sectionId: number;
  sectionTitle: string;
  onClose: () => void;
  onSelectJob: (jobId: number) => void;
}

function statusLabel(status: string) {
  switch (status) {
    case "queued":      return "Đang xếp hàng";
    case "processing":  return "Đang xử lý";
    case "completed":   return "Hoàn thành";
    case "failed":      return "Thất bại";
    default:            return status;
  }
}

export function SectionOverviewHistoryModal({
  courseId,
  sectionId,
  sectionTitle,
  onClose,
  onSelectJob,
}: Props) {
  const [jobs, setJobs] = useState<SectionOverviewJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchJobs = async () => {
      try {
        const res = await sectionOverviewService.listJobs(courseId, sectionId);
        if (active) {
          setJobs(
            (res ?? []).sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            ),
          );
        }
      } catch (err) {
        console.error("Failed to load overview jobs:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchJobs();
    return () => { active = false; };
  }, [courseId, sectionId]);

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">Lịch sử tổng quan chương</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">{sectionTitle}</div>
          </div>
        </div>
      }
      size="lg"
    >
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Spinner className="w-8 h-8 border-[3px] mb-4" />
            <p className="text-xs">Đang tải danh sách tiến trình...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Chưa có tiến trình tổng quan nào cho chương này.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const isCompleted = job.status === "completed";
              const isFailed    = job.status === "failed";
              const isPending   = !isCompleted && !isFailed;

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-blue-500/10 hover:border-blue-500 dark:hover:border-cyan-400/50 cursor-pointer transition-all bg-slate-50/50 dark:bg-[#0D192E] hover:shadow-sm"
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : isFailed ? (
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-500/20">
                        <XCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center border border-yellow-200 dark:border-yellow-500/20">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                        Job #{job.id}
                      </p>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-xs
                          ${isCompleted ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                            : isFailed ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300"
                            : isPending && job.status === "processing" ? "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
                      >
                        {statusLabel(job.status)}
                      </span>
                      <span>·</span>
                      <span>{job.question_count} câu hỏi</span>
                      <span>·</span>
                      <span>{job.language === "vi" ? "Tiếng Việt" : "English"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
