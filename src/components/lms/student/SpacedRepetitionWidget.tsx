"use client";

/**
 * SpacedRepetitionWidget.tsx
 * Student widget for SM-2 spaced repetition daily reviews.
 * Shows due cards and records quality responses (0-5).
 *
 * Usage:
 *   <SpacedRepetitionWidget courseId={123} />
 */

import { useEffect, useState, useCallback } from "react";
import {
  Sparkles, Brain, CheckCircle2, X, Clock,
  ChevronRight, RotateCcw, AlertCircle, Calendar
} from "lucide-react";
import aiService, { DueReview, ReviewStats } from "@/services/aiService";
import { cn } from "@/lib/utils";

interface Props {
  courseId: number;
}

const QUALITY_BTNS = [
  { q: 0 as const, label: "Quên hoàn toàn", short: "0", cls: "bg-red-500 hover:bg-red-600 text-white" },
  { q: 1 as const, label: "Gần như quên",    short: "1", cls: "bg-orange-500 hover:bg-orange-600 text-white" },
  { q: 2 as const, label: "Nhớ sau khi xem đáp án", short: "2", cls: "bg-amber-500 hover:bg-amber-600 text-white" },
  { q: 3 as const, label: "Nhớ nhưng khó",   short: "3", cls: "bg-yellow-400 hover:bg-yellow-500 text-white" },
  { q: 4 as const, label: "Nhớ tốt",         short: "4", cls: "bg-green-500 hover:bg-green-600 text-white" },
  { q: 5 as const, label: "Nhớ hoàn hảo",    short: "5", cls: "bg-emerald-500 hover:bg-emerald-600 text-white" },
];

export function SpacedRepetitionWidget({ courseId }: Props) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [dueCards, setDueCards] = useState<DueReview[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<"idle" | "reviewing">("idle");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, cards] = await Promise.all([
        aiService.getReviewStats(courseId),
        aiService.getDueReviews(courseId),
      ]);
      setStats(s);
      setDueCards(cards);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Không tải được dữ liệu ôn tập.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const handleRecord = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const card = dueCards[current];
    if (!card) return;
    setSubmitting(true);
    try {
      await aiService.recordReview(courseId, card.question_id, quality, card.node_id);
      if (current + 1 >= dueCards.length) {
        setDone(true);
        await load();
      } else {
        setCurrent((c) => c + 1);
        setRevealed(false);
      }
    } catch {
      // fail silently — still advance
      if (current + 1 >= dueCards.length) setDone(true);
      else { setCurrent((c) => c + 1); setRevealed(false); }
    } finally {
      setSubmitting(false);
    }
  };

  const startSession = () => {
    setCurrent(0);
    setRevealed(false);
    setDone(false);
    setSession("reviewing");
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Đang tải lịch ôn tập…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI chưa khởi động</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Idle state ───────────────────────────────────────────────────────────

  if (session === "idle") {
    const dueToday = stats?.due_today ?? 0;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center border border-violet-200 dark:border-violet-800">
            <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-50">Ôn tập thông minh</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Spaced Repetition (SM-2)</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
          {[
            { icon: <Clock className="w-4 h-4 text-red-500" />, label: "Hôm nay", value: stats?.due_today ?? 0, accent: (stats?.due_today ?? 0) > 0 ? "text-red-600 dark:text-red-400" : "" },
            { icon: <Calendar className="w-4 h-4 text-blue-500" />, label: "Sắp tới", value: stats?.upcoming ?? 0, accent: "" },
            { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, label: "Đang theo dõi", value: stats?.total_tracked ?? 0, accent: "" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-4 gap-1">
              {s.icon}
              <p className={cn("text-xl font-extrabold text-slate-900 dark:text-slate-50", s.accent)}>{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="px-5 pb-5">
          {dueToday > 0 ? (
            <button
              onClick={startSession}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Ôn tập ngay ({dueToday} câu)
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 py-3 px-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Xong rồi! Không có gì cần ôn hôm nay.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Done state ────────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">Hoàn thành rồi! 🎉</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Đã ôn tập {dueCards.length} câu hỏi hôm nay.
        </p>
        <button
          onClick={() => setSession("idle")}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Quay lại tổng quan
        </button>
      </div>
    );
  }

  // ── Card session ──────────────────────────────────────────────────────────

  const card = dueCards[current];
  const progress = ((current) / dueCards.length) * 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-violet-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Câu {current + 1} / {dueCards.length}
          </p>
        </div>
        {card.node_name && (
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {card.node_name}
          </span>
        )}
        <button
          onClick={() => setSession("idle")}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question */}
      <div className="px-5 py-6">
        <p className="text-base font-semibold text-slate-900 dark:text-slate-50 leading-relaxed mb-6">
          {card.question_text}
        </p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-600 dark:hover:text-violet-400 transition-all"
          >
            Nhấn để xem đáp án / tự đánh giá
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Bạn nhớ đến đâu?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">0 = quên hoàn toàn → 5 = nhớ hoàn hảo</p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {QUALITY_BTNS.map((b) => (
                <button
                  key={b.q}
                  onClick={() => handleRecord(b.q)}
                  disabled={submitting}
                  title={b.label}
                  className={cn(
                    "flex flex-col items-center py-3 px-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50",
                    b.cls
                  )}
                >
                  <span className="text-xl">{b.short}</span>
                  <span className="text-xs font-medium mt-1 leading-tight text-center opacity-90 hidden md:block">
                    {b.label.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Điểm càng cao → lần ôn tiếp sẽ càng xa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
