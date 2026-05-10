"use client";

/**
 * LearnersTab
 *
 * Displays the list of enrolled learners for a course with status filtering.
 * Extracted from the old monolithic [courseId]/page.tsx.
 */

import { useCallback, useEffect, useState } from "react";
import { Users, CheckCircle2 } from "lucide-react";
import lmsService from "@/services/lmsService";
import { Badge, EmptyState, PageLoader, StatCard, TabBar } from "@/components/lms/shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Learner {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  status: "ACCEPTED" | "REJECTED";
  enrolled_at: string;
}

interface LearnersTabProps {
  courseId: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LearnersTab({ courseId }: LearnersTabProps) {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"ALL" | "ACCEPTED" | "REJECTED">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const f = filter === "ALL" ? undefined : (filter as "ACCEPTED" | "REJECTED");
      const data = await lmsService.getCourseLearners(courseId, f);
      setLearners(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [courseId, filter]);

  useEffect(() => { load(); }, [filter]);

  const counts = {
    accepted: learners.filter(l => l.status === "ACCEPTED").length,
    rejected: learners.filter(l => l.status === "REJECTED").length,
  };

  const filtered =
    filter === "ALL" ? learners : learners.filter(l => l.status === filter);

  return (
    <div className="space-y-5">
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Đã duyệt"
          value={counts.accepted}
          icon={<CheckCircle2 className="w-4 h-4" />}
          accent="green"
        />
      </div>

      {/* Filter tabs */}
      <TabBar
        tabs={[
          { id: "ALL",      label: "Tất cả",   badge: learners.length },
          { id: "ACCEPTED", label: "Đã duyệt", badge: counts.accepted },
          { id: "REJECTED", label: "Từ chối"                          },
        ]}
        active={filter}
        onChange={setFilter as (id: string) => void}
      />

      {/* Learner list */}
      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="Không có học viên"
          description={
            filter === "ALL"
              ? "Chưa có học viên nào đăng ký khóa học này."
              : "Không có học viên nào với trạng thái đã chọn."
          }
        />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {filtered.map(l => (
            <div
              key={l.id}
              className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-400 flex-shrink-0">
                {l.student_name.charAt(0).toUpperCase()}
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-50 truncate text-sm">
                  {l.student_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {l.student_email}
                </p>
              </div>

              {/* Status badge */}
              <Badge variant={l.status === "ACCEPTED" ? "green" : "red"}>
                {l.status === "ACCEPTED" ? "Đã duyệt" : "Từ chối"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
