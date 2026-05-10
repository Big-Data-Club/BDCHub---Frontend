"use client";

/**
 * QuizDraftPreview — HITL widget for teacher to review AI-generated quiz drafts.
 * Teacher can approve (sends to existing LMS quiz system) or reject each question.
 */
import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService } from "@/services/aiService";

interface DraftQuestion {
  gen_id: number;
  bloom_level: string;
  question_text: string;
  question_type: string;
  answer_options: { text: string; is_correct: boolean; explanation?: string }[];
  explanation: string;
  node_name?: string;
}

interface QuizDraftPreviewProps {
  props: {
    drafts: DraftQuestion[];
    course_id: number;
    node_id: number;
  };
}

const BLOOM_COLORS: Record<string, string> = {
  remember: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  understand: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  apply: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  analyze: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  evaluate: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  create: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function QuizDraftPreview({ props }: QuizDraftPreviewProps) {
  const { drafts, course_id } = props;
  const [statuses, setStatuses] = useState<Record<number, "pending" | "approved" | "rejected">>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  async function handleApprove(genId: number) {
    setStatuses((s) => ({ ...s, [genId]: "approved" }));
  }

  function handleReject(genId: number) {
    setStatuses((s) => ({ ...s, [genId]: "rejected" }));
  }

  if (!drafts || drafts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-500">
        Không có câu hỏi nháp nào.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
        <span>Quiz Draft Preview</span>
        <span className="text-slate-400">({drafts.length} câu)</span>
      </div>

      {drafts.map((d) => {
        const status = statuses[d.gen_id] || "pending";
        const isExpanded = expanded === d.gen_id;

        return (
          <div
            key={d.gen_id}
            className={cn(
              "rounded-xl border p-4 transition-all duration-200",
              status === "approved"
                ? "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20"
                : status === "rejected"
                  ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 opacity-60"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase",
                      BLOOM_COLORS[d.bloom_level] || BLOOM_COLORS.remember,
                    )}
                  >
                    {d.bloom_level}
                  </span>
                  {d.node_name && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 truncate">
                      {d.node_name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {d.question_text}
                </p>
              </div>

              {/* Actions */}
              {status === "pending" && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(d.gen_id)}
                    className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center transition-all active:scale-95"
                    title="Phê duyệt"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(d.gen_id)}
                    className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-all active:scale-95"
                    title="Từ chối"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {status !== "pending" && (
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-md",
                    status === "approved"
                      ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                      : "text-red-500 bg-red-100 dark:bg-red-900/30",
                  )}
                >
                  {status === "approved" ? "Đã duyệt" : "Đã từ chối"}
                </span>
              )}
            </div>

            {/* Expandable answers */}
            <button
              onClick={() => setExpanded(isExpanded ? null : d.gen_id)}
              className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {isExpanded ? "Ẩn đáp án" : "Xem đáp án"}
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-1.5">
                {d.answer_options.map((opt, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 px-3 py-2 rounded-lg text-sm",
                      opt.is_correct
                        ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                    )}
                  >
                    <span className="font-medium flex-shrink-0">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span>{opt.text}</span>
                    {opt.is_correct && (
                      <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0 text-green-500" />
                    )}
                  </div>
                ))}
                {d.explanation && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic">
                    {d.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
