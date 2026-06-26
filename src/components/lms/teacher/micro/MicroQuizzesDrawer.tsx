"use client";

/**
 * MicroQuizzesDrawer
 *
 * Right-hand panel that opens after a quiz generation job is queued.
 * Polls job status every few seconds, then renders quiz cards.
 * Each quiz card shows structured question form (not raw Markdown).
 * Teachers can edit individual questions, options, and explanations.
 * When ready, they publish into a chosen section which creates a
 * full QUIZ SectionContent with auto-grade support.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, Edit3, Loader2, Save, Send, Trash2, X,
  CheckCircle, Circle, Plus, Minus,
} from "lucide-react";
import microQuizService, {
  parseQuestions, unwrapNullString, unwrapNullInt, bloomLabel, bloomColor,
  type JobWithQuizzes, type MicroQuiz, type QuizQuestionItem, type QuizQuestionOption,
} from "@/services/microQuizService";
import type { Section } from "@/types";

interface Props {
  jobId: number;
  sections: Section[];
  onClose: () => void;
  onPublished: (sectionId: number) => void;
}

const POLL_INTERVAL_MS = 4000;

export function MicroQuizzesDrawer({ jobId, sections, onClose, onPublished }: Props) {
  const [data, setData] = useState<JobWithQuizzes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const refresh = useCallback(async () => {
    try {
      const res = await microQuizService.getJob(jobId);
      setData(res);
      const status = res.job?.status;
      if (status === "completed" || status === "failed") {
        stopPoll();
      }
    } catch {
      setError("Không tải được dữ liệu");
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
  const quizzes = useMemo(
    () => (data?.quizzes ?? []).slice().sort((a, b) => a.order_index - b.order_index || a.id - b.id),
    [data],
  );

  const handleDelete = async (q: MicroQuiz) => {
    if (!confirm(`Xoá bản nháp: "${q.title}"?`)) return;
    await microQuizService.deleteQuiz(q.id);
    await refresh();
  };

  const handlePublish = async (q: MicroQuiz, sectionId: number) => {
    if (!sectionId) {
      alert("Vui lòng chọn chương đích");
      return;
    }
    await microQuizService.publishQuiz(q.id, sectionId);
    await refresh();
    onPublished(sectionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-slate-900 dark:text-slate-50">
              Bản nháp micro quiz #{jobId}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Đang tải…
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <JobStatusCard job={job} />

            {quizzes.length === 0 && job?.status === "processing" && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
                AI đang phân tích tài liệu… Quiz sẽ xuất hiện ở đây sau ít phút.
              </div>
            )}

            {quizzes.map((q, idx) => (
              <QuizCard
                key={q.id}
                quiz={q}
                idx={idx + 1}
                sections={sections}
                isEditing={editingId === q.id}
                onStartEdit={() => setEditingId(q.id)}
                onCancelEdit={() => setEditingId(null)}
                onSaved={async () => {
                  setEditingId(null);
                  await refresh();
                }}
                onDelete={() => handleDelete(q)}
                onPublish={(sid) => handlePublish(q, sid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function JobStatusCard({ job }: { job: JobWithQuizzes["job"] | undefined }) {
  if (!job) return null;
  const colorByStatus: Record<string, string> = {
    queued: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    processing: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    completed: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
    failed: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300",
  };
  const labelMap: Record<string, string> = {
    queued: "Đang xếp hàng",
    processing: "Đang xử lý",
    completed: "Hoàn thành",
    failed: "Thất bại",
  };
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorByStatus[job.status] || ""}`}>
          {labelMap[job.status] || job.status}
        </span>
        <span className="text-xs text-slate-500">
          {job.quizzes_count > 0 && `${job.quizzes_count} bộ quiz`}
        </span>
      </div>
      {job.status === "processing" && (
        <div className="mt-2">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${job.progress || 0}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1">{job.stage || "đang xử lý"} · {job.progress || 0}%</p>
        </div>
      )}
      {job.status === "failed" && job.error?.Valid && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{job.error.String}</p>
      )}
    </div>
  );
}

// ─── Quiz Card ───────────────────────────────────────────────────────────────

interface QuizCardProps {
  quiz: MicroQuiz;
  idx: number;
  sections: Section[];
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
  onDelete: () => void;
  onPublish: (sectionId: number) => void;
}

function QuizCard({
  quiz, idx, sections, isEditing, onStartEdit, onCancelEdit, onSaved, onDelete, onPublish,
}: QuizCardProps) {
  const questions = useMemo(() => parseQuestions(quiz.questions_json), [quiz.questions_json]);
  const [title, setTitle] = useState(quiz.title);
  const [summary, setSummary] = useState(unwrapNullString(quiz.summary));
  const [editQuestions, setEditQuestions] = useState<QuizQuestionItem[]>(questions);
  const [saving, setSaving] = useState(false);
  const [pickedSection, setPickedSection] = useState<number>(unwrapNullInt(quiz.section_id) || 0);

  const isPublished = quiz.status === "published";

  // Sync local state when upstream changes
  useEffect(() => {
    if (!isEditing) {
      setTitle(quiz.title);
      setSummary(unwrapNullString(quiz.summary));
      setEditQuestions(parseQuestions(quiz.questions_json));
      if (unwrapNullInt(quiz.section_id)) {
        setPickedSection(unwrapNullInt(quiz.section_id) || 0);
      }
    }
  }, [quiz, isEditing]);

  const save = async () => {
    setSaving(true);
    try {
      await microQuizService.updateQuiz(quiz.id, {
        title,
        summary,
        questions_json: editQuestions,
        order_index: quiz.order_index,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  // Question editing helpers
  const updateQuestion = (qIdx: number, field: keyof QuizQuestionItem, value: string) => {
    setEditQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, field: keyof QuizQuestionOption, value: string | boolean) => {
    setEditQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const newOpts = q.options.map((o, j) => {
        if (j !== oIdx) return field === "is_correct" && value === true ? { ...o, is_correct: false } : o;
        return { ...o, [field]: value };
      });
      return { ...q, options: newOpts };
    }));
  };

  const addOption = (qIdx: number) => {
    setEditQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      return { ...q, options: [...q.options, { text: "", is_correct: false }] };
    }));
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setEditQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx || q.options.length <= 2) return q;
      return { ...q, options: q.options.filter((_, j) => j !== oIdx) };
    }));
  };

  const removeQuestion = (qIdx: number) => {
    if (editQuestions.length <= 1) return;
    setEditQuestions(prev => prev.filter((_, i) => i !== qIdx));
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
        <span className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {idx}
        </span>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold"
            />
          ) : (
            <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">{quiz.title}</p>
          )}
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
            <span>{questions.length} câu hỏi</span>
            {isPublished && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium">
                Đã xuất bản
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isPublished && !isEditing && (
            <button
              title="Chỉnh sửa câu hỏi"
              onClick={onStartEdit}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isPublished && (
            <button
              title="Xoá bản nháp"
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isEditing ? (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Mô tả</label>
            <input
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              placeholder="Tóm tắt bài quiz (tuỳ chọn)"
            />
          </div>

          {/* Questions */}
          {editQuestions.map((q, qIdx) => (
            <div key={qIdx} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Câu {qIdx + 1}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${bloomColor(q.bloom_level)}`}>
                    {bloomLabel(q.bloom_level)}
                  </span>
                </div>
                {editQuestions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIdx)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400"
                    title="Xoá câu hỏi"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                )}
              </div>

              <textarea
                rows={2}
                value={q.question}
                onChange={e => updateQuestion(qIdx, "question", e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                placeholder="Nội dung câu hỏi (hỗ trợ Markdown)"
              />

              {/* Options */}
              <div className="space-y-1.5">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateOption(qIdx, oIdx, "is_correct", true)}
                      className="flex-shrink-0"
                      title={opt.is_correct ? "Đáp án đúng" : "Chọn là đáp án đúng"}
                    >
                      {opt.is_correct
                        ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                        : <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                    </button>
                    <input
                      value={opt.text}
                      onChange={e => updateOption(qIdx, oIdx, "text", e.target.value)}
                      className={`flex-1 px-2 py-1 rounded border text-sm ${
                        opt.is_correct
                          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                      placeholder={`Phương án ${String.fromCharCode(65 + oIdx)}`}
                    />
                    {q.options.length > 2 && (
                      <button
                        onClick={() => removeOption(qIdx, oIdx)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length < 6 && (
                  <button
                    onClick={() => addOption(qIdx)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 ml-6"
                  >
                    <Plus className="w-3 h-3" /> Thêm phương án
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Giải thích</label>
                <textarea
                  rows={1}
                  value={q.explanation}
                  onChange={e => updateQuestion(qIdx, "explanation", e.target.value)}
                  className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                  placeholder="Giải thích tại sao đáp án đúng"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Huỷ
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Read-only question preview */}
          <div className="px-4 py-3 max-h-80 overflow-y-auto space-y-3">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Câu {qIdx + 1}.
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${bloomColor(q.bloom_level)}`}>
                    {bloomLabel(q.bloom_level)}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 mb-1">{q.question}</p>
                <div className="space-y-0.5 ml-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`text-xs px-2 py-0.5 rounded ${
                        opt.is_correct
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-medium"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {opt.is_correct ? "✓ " : "  "}{opt.text}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-slate-500 italic mt-1 ml-2">💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {/* Publish bar */}
          {!isPublished && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-2">
              <select
                value={pickedSection || ""}
                onChange={e => setPickedSection(Number(e.target.value) || 0)}
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="">- Chọn chương để xuất bản -</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <button
                onClick={() => onPublish(pickedSection)}
                disabled={!pickedSection}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                Xuất bản Quiz
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
