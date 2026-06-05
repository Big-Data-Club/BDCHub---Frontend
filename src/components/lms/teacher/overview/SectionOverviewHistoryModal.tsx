"use client";

/**
 * SectionOverviewHistoryModal
 *
 * Lists past section overview generation jobs for a given section.
 * Mirrors MicroLessonHistoryModal pattern.
 */

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { BookOpen, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { sectionOverviewService } from "@/services/sectionOverviewService";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Lịch sử tổng quan chương
              </h3>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-7 truncate max-w-sm">
              {sectionTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
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
              <p className="text-slate-500 dark:text-slate-400">
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
                    className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors bg-white dark:bg-slate-900 hover:shadow-sm"
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : isFailed ? (
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                          <XCircle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                          Job #{job.id}
                        </p>
                        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(job.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold
                            ${isCompleted ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                              : isFailed ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                              : isPending && job.status === "processing" ? "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300"
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
      </div>
    </div>
  );
}
