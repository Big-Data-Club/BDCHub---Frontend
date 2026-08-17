"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, Lightbulb, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getRecommendations,
  type RecommendationItem,
  type RecommendationSet,
  trackRecommendationEvent,
} from "@/services/recommendationService";

function reason(item: RecommendationItem): string {
  const codes = new Set(item.why_facts.map((fact) => fact.code));
  if (codes.has("struggle_detected")) return "Dựa trên phần bạn đang gặp khó khăn trong quá trình học.";
  if (codes.has("low_quick_check_accuracy")) return "Dựa trên kết quả Quick Check gần đây của bạn.";
  if (codes.has("course_progress")) return "Dựa trên tiến độ hiện tại trong khóa học.";
  return "Đây là bước phù hợp trong lộ trình học hiện tại của bạn.";
}

export function RecommendationWidget({ props }: { props: { recommendation_set?: RecommendationSet } }) {
  const router = useRouter();
  const [recommendationSet, setRecommendationSet] = useState(props.recommendation_set);
  const [pending, setPending] = useState<RecommendationItem | null>(null);
  const [minutes, setMinutes] = useState(20);
  const [format, setFormat] = useState<"practice" | "theory" | "mixed">("mixed");
  const [updating, setUpdating] = useState(false);
  const emitted = useRef(new Set<string>());

  useEffect(() => setRecommendationSet(props.recommendation_set), [props.recommendation_set]);

  useEffect(() => {
    if (!recommendationSet) return;
    for (const item of recommendationSet.items || []) {
      if (!emitted.current.has(item.recommendation_id)) {
        emitted.current.add(item.recommendation_id);
        trackRecommendationEvent(item, recommendationSet.recommendation_set_id, "impression", "chat");
      }
    }
  }, [recommendationSet]);

  if (!recommendationSet) return null;
  if (recommendationSet.clarification_needed) {
    return <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">{recommendationSet.clarification_message}</p>;
  }

  const confirm = () => {
    if (!pending) return;
    trackRecommendationEvent(pending, recommendationSet.recommendation_set_id, "accept", "chat");
    trackRecommendationEvent(pending, recommendationSet.recommendation_set_id, "started", "chat");
    if (pending.href?.startsWith("/") && !pending.href.startsWith("//")) router.push(pending.href);
    setPending(null);
  };

  const refreshFromEdits = async () => {
    const courseId = recommendationSet.items[0]?.entity.course_id;
    if (!courseId) return;
    setUpdating(true);
    try {
      setRecommendationSet(await getRecommendations({
        surface: "chat",
        courseId,
        timeBudgetMinutes: minutes,
        preferFormat: format,
      }));
      setPending(null);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-blue-200/60 dark:border-blue-500/20 bg-blue-50/50 dark:bg-[#0F1E35] p-4 shadow-none">
      <div className="flex items-center gap-2 text-sm font-bold text-blue-800 dark:text-cyan-400">
        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
        <span>Gợi ý học tập cho bạn</span>
      </div>
      {recommendationSet.fallback && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Đang dùng gợi ý an toàn dự phòng; dữ liệu cá nhân hóa sẽ cập nhật sau.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/80 dark:bg-[#070E1C] p-2.5 text-xs border border-slate-200/60 dark:border-blue-500/10">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Tùy chỉnh:</span>
        <select
          value={minutes}
          onChange={(event) => setMinutes(Number(event.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-blue-500/20 dark:bg-[#0D192E] dark:text-slate-200 outline-none"
        >
          <option value={10}>10 phút</option>
          <option value={20}>20 phút</option>
          <option value={30}>30 phút</option>
          <option value={45}>45 phút</option>
        </select>
        <select
          value={format}
          onChange={(event) => setFormat(event.target.value as "practice" | "theory" | "mixed")}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-blue-500/20 dark:bg-[#0D192E] dark:text-slate-200 outline-none"
        >
          <option value="mixed">Cân bằng</option>
          <option value="practice">Chỉ thực hành</option>
          <option value="theory">Đọc lý thuyết</option>
        </select>
        <button
          disabled={updating}
          onClick={refreshFromEdits}
          className="rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white disabled:opacity-50 hover:bg-blue-700 transition active:scale-95 text-xs"
        >
          {updating ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </div>
      {recommendationSet.items.map((item) => (
        <div key={item.recommendation_id} className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-blue-500/15 dark:bg-[#070E1C]">
          <div className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-xs font-extrabold text-blue-700 dark:text-cyan-400">
              {item.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-350 leading-relaxed">{item.description}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock3 className="h-3 w-3 text-blue-500 dark:text-cyan-400" />
              {item.estimated_minutes ?? 15} phút
            </span>
            <button className="hover:text-blue-600 dark:hover:text-cyan-400 hover:underline font-medium" title={reason(item)}>
              Vì sao gợi ý này?
            </button>
          </div>
          <button
            onClick={() => { trackRecommendationEvent(item, recommendationSet.recommendation_set_id, "click", "chat"); setPending(item); }}
            className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95 shadow-xs"
          >
            Xem và xác nhận
          </button>
        </div>
      ))}
      {pending && (
        <div className="rounded-xl border border-blue-300 bg-white p-3.5 dark:border-cyan-500/30 dark:bg-[#070E1C] shadow-sm">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Mở “{pending.title}”?</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bạn vẫn có thể quay lại hoặc đổi gợi ý sau đó.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={confirm} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition">
              <CheckCircle2 className="h-3.5 w-3.5" />Xác nhận
            </button>
            <button onClick={() => { trackRecommendationEvent(pending, recommendationSet.recommendation_set_id, "reject", "chat"); setPending(null); }} className={cn("inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition dark:border-blue-500/20 dark:bg-[#0D192E] dark:text-slate-300 dark:hover:bg-[#162644]")}>
              <X className="h-3.5 w-3.5" />Để sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
