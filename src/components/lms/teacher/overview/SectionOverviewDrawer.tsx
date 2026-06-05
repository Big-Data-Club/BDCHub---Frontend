"use client";

/**
 * SectionOverviewDrawer
 *
 * Right-hand drawer that opens after a section overview generation job is
 * created. Polls job status every 3 seconds while queued/processing, then
 * renders two tabs:
 *   1. Bài học tổng quan – editable Markdown + references popup + publish
 *   2. Quiz tổng quan    – MCQ list with per-question edit/delete + publish
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen, ChevronLeft, CheckCircle2, Edit3, ExternalLink,
  HelpCircle, Loader2, Save, Send, Terminal, Trash2, X,
} from "lucide-react";
import { sectionOverviewService } from "@/services/sectionOverviewService";
import type {
  SectionOverviewJob,
  SectionOverviewJobDetail,
  SectionOverviewLesson,
  SectionOverviewQuiz,
  OverviewQuestion,
  OverviewReferenceItem,
  Section,
} from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  jobId: number;
  sectionTitle: string;
  sections: Section[];
  onClose: () => void;
  onLessonPublished: (sectionId: number) => void;
  onQuizPublished: (sectionId: number) => void;
}

const POLL_INTERVAL_MS = 3000;

// ─── Drawer root ──────────────────────────────────────────────────────────────

export function SectionOverviewDrawer({
  jobId,
  sectionTitle,
  sections,
  onClose,
  onLessonPublished,
  onQuizPublished,
}: Props) {
  const [data, setData] = useState<SectionOverviewJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"lesson" | "quiz">("lesson");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const refresh = useCallback(async () => {
    try {
      const res = await sectionOverviewService.getJob(jobId);
      setData(res);
      const status = res?.job?.status;
      if (status === "completed" || status === "failed") {
        stopPoll();
      }
    } catch {
      setFetchError("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => stopPoll();
  }, [refresh]);

  const job = data?.job;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <h2 className="font-bold text-slate-900 dark:text-slate-50 truncate">
              Tổng quan: {sectionTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Đang tải…
          </div>
        ) : fetchError ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
            {fetchError}
          </div>
        ) : (
          <>
            {/* Job status / progress */}
            {(job?.status === "queued" || job?.status === "processing") && (
              <JobProgressBanner job={job} />
            )}

            {job?.status === "failed" && (
              <div className="px-6 py-3 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Tác vụ thất bại{job.error_msg ? `: ${job.error_msg}` : "."}
                </p>
              </div>
            )}

            {job && job.status !== "completed" && (
              <div className="flex-1 overflow-y-auto">
                <AgentLogsAccordion job={job} />
              </div>
            )}

            {job?.status === "completed" && (
              <>
                {/* Tab bar */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-6">
                  <TabBtn
                    active={activeTab === "lesson"}
                    onClick={() => setActiveTab("lesson")}
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Bài học tổng quan"
                  />
                  <TabBtn
                    active={activeTab === "quiz"}
                    onClick={() => setActiveTab("quiz")}
                    icon={<HelpCircle className="w-4 h-4" />}
                    label="Quiz tổng quan"
                  />
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeTab === "lesson" ? (
                    <LessonTab
                      lesson={data?.lesson ?? null}
                      onSaved={refresh}
                      onPublished={(sid) => { refresh(); onLessonPublished(sid); }}
                      job={job}
                    />
                  ) : (
                    <QuizTab
                      quiz={data?.quiz ?? null}
                      onSaved={refresh}
                      onPublished={(sid) => { refresh(); onQuizPublished(sid); }}
                      job={job}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors
        ${active
          ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
          : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Job progress banner ──────────────────────────────────────────────────────

function JobProgressBanner({ job }: { job: SectionOverviewJobDetail["job"] }) {
  return (
    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-yellow-50 dark:bg-yellow-950/20">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="w-4 h-4 animate-spin text-yellow-600 dark:text-yellow-400" />
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
          {job.status === "queued" ? "Đang xếp hàng chờ xử lý…" : "AI đang tổng hợp nội dung…"}
        </p>
      </div>
      <div className="h-1.5 bg-yellow-200 dark:bg-yellow-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-500 dark:bg-yellow-400 transition-all duration-500"
          style={{ width: `${job.progress || 0}%` }}
        />
      </div>
      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
        {job.stage || "đang xử lý"} · {job.progress || 0}%
      </p>
    </div>
  );
}

// ─── Lesson tab ───────────────────────────────────────────────────────────────

function LessonTab({
  lesson,
  onSaved,
  onPublished,
  job,
}: {
  lesson: SectionOverviewLesson | null;
  onSaved: () => void;
  onPublished: (sectionId: number) => void;
  job?: SectionOverviewJob;
}) {
  const [markdown, setMarkdown] = useState(lesson?.markdown_content ?? "");
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [refPopup, setRefPopup] = useState<OverviewReferenceItem | null>(null);

  // Sync when lesson prop changes (after refresh)
  useEffect(() => {
    setMarkdown(lesson?.markdown_content ?? "");
    setTitle(lesson?.title ?? "");
  }, [lesson]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
        Chưa có bài học tổng quan.
      </div>
    );
  }

  const isPublished = lesson.status === "published";

  const save = async () => {
    setSaving(true);
    try {
      await sectionOverviewService.updateLesson(lesson.id, { title, markdown_content: markdown });
      onSaved();
      showToast("Đã lưu thay đổi");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!confirm("Xuất bản bài học tổng quan này?")) return;
    setPublishing(true);
    try {
      await sectionOverviewService.publishLesson(lesson.id, {
        section_id: lesson.section_id,
        order_index: 0,
      });
      onPublished(lesson.section_id);
      showToast("Đã xuất bản bài học tổng quan!");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Toast */}
      {toast && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          ✓ {toast}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
          Tiêu đề bài học
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPublished}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />
      </div>

      {/* Markdown editor */}
      <div>
        <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
          Nội dung Markdown
        </label>
        <textarea
          rows={18}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          disabled={isPublished}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />
      </div>

      {/* References */}
      {lesson.references && lesson.references.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tài liệu tham chiếu ({lesson.references.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {lesson.references.map((ref) => (
              <button
                key={ref.content_id}
                onClick={() => setRefPopup(ref)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {ref.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end pt-1">
        {isPublished ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            Đã xuất bản
          </span>
        ) : (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 disabled:opacity-60 transition-all duration-200 active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu thay đổi
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 disabled:opacity-60 transition-all duration-200 active:scale-95"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Xuất bản bài học
            </button>
          </>
        )}
      </div>

      {job && <AgentLogsAccordion job={job} />}

      {/* Reference popup */}
      {refPopup && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setRefPopup(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">
                Tài liệu tham chiếu
              </h4>
              <button
                onClick={() => setRefPopup(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <span className="font-medium">Tiêu đề:</span> {refPopup.title}
              </p>
              <p>
                <span className="font-medium">Loại:</span> {refPopup.content_type}
              </p>
              <p className="text-xs text-slate-400 italic mt-3">
                Xem chi tiết nội dung trong tab <strong>Nội dung</strong> của chương.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quiz tab ─────────────────────────────────────────────────────────────────

function QuizTab({
  quiz,
  onSaved,
  onPublished,
  job,
}: {
  quiz: SectionOverviewQuiz | null;
  onSaved: () => void;
  onPublished: (sectionId: number) => void;
  job?: SectionOverviewJob;
}) {
  const [questions, setQuestions] = useState<OverviewQuestion[]>(
    quiz?.questions ?? [],
  );
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sync when quiz prop changes
  useEffect(() => {
    setQuestions(quiz?.questions ?? []);
  }, [quiz]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
        Chưa có quiz tổng quan.
      </div>
    );
  }

  const isPublished = quiz.status === "published";

  const save = async () => {
    setSaving(true);
    try {
      await sectionOverviewService.updateQuiz(quiz.id, { questions });
      onSaved();
      showToast("Đã lưu thay đổi");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!confirm("Xuất bản quiz tổng quan này?")) return;
    setPublishing(true);
    try {
      await sectionOverviewService.publishQuiz(quiz.id, {
        section_id: quiz.section_id,
        order_index: 0,
        time_limit_minutes: 30,
      });
      onPublished(quiz.section_id);
      showToast("Đã xuất bản quiz tổng quan!");
    } finally {
      setPublishing(false);
    }
  };

  const deleteQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const updateQuestion = (idx: number, updated: OverviewQuestion) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? updated : q)));
  };

  return (
    <div className="px-6 py-5 space-y-5">
      {/* Toast */}
      {toast && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          ✓ {toast}
        </div>
      )}

      {/* Quiz meta */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex-1 truncate">
          {quiz.title}
        </p>
        <span className="text-xs text-slate-500">
          {questions.length} câu hỏi
        </span>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <QuestionCard
            key={idx}
            idx={idx}
            question={q}
            isEditing={editingIdx === idx}
            isPublished={isPublished}
            onStartEdit={() => setEditingIdx(idx)}
            onCancelEdit={() => setEditingIdx(null)}
            onSave={(updated) => { updateQuestion(idx, updated); setEditingIdx(null); }}
            onDelete={() => deleteQuestion(idx)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end pt-1">
        {isPublished ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            Đã xuất bản
          </span>
        ) : (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 disabled:opacity-60 transition-all duration-200 active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu thay đổi
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 disabled:opacity-60 transition-all duration-200 active:scale-95"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Xuất bản quiz
            </button>
          </>
        )}
      </div>
      {job && <AgentLogsAccordion job={job} />}
    </div>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────

const BLOOM_COLORS: Record<string, string> = {
  remember:     "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  understand:   "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
  apply:        "bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300",
  analyze:      "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  evaluate:     "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300",
  create:       "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
};

interface QuestionCardProps {
  idx: number;
  question: OverviewQuestion;
  isEditing: boolean;
  isPublished: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updated: OverviewQuestion) => void;
  onDelete: () => void;
}

function QuestionCard({
  idx, question, isEditing, isPublished, onStartEdit, onCancelEdit, onSave, onDelete,
}: QuestionCardProps) {
  const [draft, setDraft] = useState<OverviewQuestion>(question);

  // Sync draft if the upstream question changes (after list-level save)
  useEffect(() => {
    if (!isEditing) setDraft(question);
  }, [question, isEditing]);

  const updateOption = (optIdx: number, field: "text" | "is_correct", value: string | boolean) => {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.map((o, i) =>
        i === optIdx ? { ...o, [field]: value } : o,
      ),
    }));
  };

  const bloomColor = BLOOM_COLORS[question.bloom_level?.toLowerCase() ?? ""] ?? BLOOM_COLORS.remember;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
        <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <textarea
              rows={2}
              value={draft.question}
              onChange={(e) => setDraft((p) => ({ ...p, question: e.target.value }))}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            />
          ) : (
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
              {question.question}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${bloomColor}`}>
              {question.bloom_level || "remember"}
            </span>
            {question.reference_content_ids?.map((id) => (
              <span
                key={id}
                className="px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                #{id}
              </span>
            ))}
          </div>
        </div>
        {!isPublished && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isEditing && (
              <button
                title="Sửa câu hỏi"
                onClick={onStartEdit}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              title="Xoá câu hỏi"
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="px-4 py-3 space-y-2">
        {(isEditing ? draft.options : question.options).map((opt, optIdx) => (
          <div
            key={optIdx}
            className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm
              ${opt.is_correct
                ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              }`}
          >
            {isEditing ? (
              <>
                <input
                  type="checkbox"
                  checked={draft.options[optIdx].is_correct}
                  onChange={(e) => updateOption(optIdx, "is_correct", e.target.checked)}
                  className="mt-0.5 flex-shrink-0 accent-indigo-600"
                />
                <input
                  value={draft.options[optIdx].text}
                  onChange={(e) => updateOption(optIdx, "text", e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-200"
                />
              </>
            ) : (
              <>
                <span className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center
                  ${opt.is_correct
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {opt.is_correct && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className={opt.is_correct
                  ? "text-emerald-800 dark:text-emerald-200 font-medium"
                  : "text-slate-700 dark:text-slate-300"
                }>
                  {opt.text}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">
              Giải thích
            </label>
            <textarea
              rows={2}
              value={draft.explanation}
              onChange={(e) => setDraft((p) => ({ ...p, explanation: e.target.value }))}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        ) : (
          question.explanation && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              💡 {question.explanation}
            </p>
          )
        )}
      </div>

      {/* Edit action bar */}
      {isEditing && (
        <div className="flex items-center justify-end gap-2 px-4 pb-3">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Huỷ
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Collapsible logs history component ───────────────────────────────────────

function AgentLogsAccordion({ job }: { job: SectionOverviewJobDetail["job"] }) {
  const [open, setOpen] = useState(false);
  if (!job?.logs) return null;

  const logLines = job.logs.split("\n").filter(Boolean);

  return (
    <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 pb-2">
      <details
        className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden"
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex items-center justify-between px-4 py-3 font-semibold text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            <span>Xem lịch sử suy nghĩ & làm việc của các AI Agents</span>
          </div>
          <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform duration-200">
            ▼
          </span>
        </summary>
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-950 p-4 font-mono text-[11px] text-slate-300 dark:text-slate-400 overflow-x-auto max-h-60 overflow-y-auto space-y-1">
          {logLines.map((line, idx) => {
            let color = "text-slate-300";
            if (line.includes("Thất bại") || line.includes("Lỗi") || line.includes("failed") || line.includes("thất bại")) {
              color = "text-red-400";
            } else if (line.includes("Hoàn thành") || line.includes("thành công") || line.includes("completed") || line.includes("hoàn thành")) {
              color = "text-emerald-400";
            } else if (line.includes("Coordinator")) {
              color = "text-indigo-400 font-semibold";
            } else if (line.includes("Agent")) {
              color = "text-amber-400";
            }
            return (
              <div key={idx} className={`${color} whitespace-pre-wrap`}>
                {line}
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
