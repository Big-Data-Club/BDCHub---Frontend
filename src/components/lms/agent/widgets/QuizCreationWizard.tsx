"use client";

/**
 * QuizCreationWizard — Enhanced HITL widget for teachers.
 * Allows configuring quiz settings (title, duration, section) and 
 * reviewing AI-generated questions before publishing in one flow.
 */
import { useState, useEffect } from "react";
import { Check, X, ChevronDown, ChevronUp, Clock, BookOpen, Save, Loader2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizService } from "@/services/quizService";
import { lmsService } from "@/services/lmsService";

interface DraftQuestion {
  gen_id: number;
  bloom_level: string;
  question_text: string;
  question_type: string;
  answer_options: { text: string; is_correct: boolean; explanation?: string }[];
  explanation: string;
  node_name?: string;
}

interface QuizCreationWizardProps {
  props: {
    drafts: DraftQuestion[];
    course_id: number;
    node_id: number;
    initial_config: {
      quiz_title: string;
      time_limit_minutes: number;
      suggested_section_id: number | null;
      description?: string;
    };
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

const NEW_SECTION_VALUE = -1;

const getAnswerOptions = (options: any): any[] => {
  if (Array.isArray(options)) return options;
  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (typeof options === "object" && options !== null) {
    return Object.values(options);
  }
  return [];
};

export function QuizCreationWizard({ props }: QuizCreationWizardProps) {
  const { drafts, course_id, initial_config } = props;

  // -- Configuration State --
  const [title, setTitle] = useState(initial_config.quiz_title);
  const [duration, setDuration] = useState(initial_config.time_limit_minutes);
  const [description, setDescription] = useState(initial_config.description || "");
  const [selectedSectionId, setSelectedSectionId] = useState<number>(initial_config.suggested_section_id || 0);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [sections, setSections] = useState<any[]>([]);

  // -- Question Review State --
  const [statuses, setStatuses] = useState<Record<number, "pending" | "approved" | "rejected">>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  // -- Workflow State --
  const [isSaving, setIsSaving] = useState(false);
  const [saveStep, setSaveStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-approve all questions by default for faster workflow
  useEffect(() => {
    if (drafts.length > 0 && Object.keys(statuses).length === 0) {
      const initial: Record<number, "approved"> = {};
      drafts.forEach(d => initial[d.gen_id] = "approved");
      setStatuses(initial);
    }
  }, [drafts]);

  // Fetch sections
  useEffect(() => {
    async function fetchSections() {
      try {
        const resp = await lmsService.listSections(course_id);
        const sectionList = resp.data || [];
        setSections(sectionList);
        
        // If suggested section exists in list, select it
        if (initial_config.suggested_section_id && sectionList.some((s: any) => s.id === initial_config.suggested_section_id)) {
            setSelectedSectionId(initial_config.suggested_section_id);
        } else if (sectionList.length > 0 && !selectedSectionId) {
            setSelectedSectionId(sectionList[0].id);
        } else if (sectionList.length === 0) {
            setSelectedSectionId(NEW_SECTION_VALUE);
        }
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      }
    }
    fetchSections();
  }, [course_id, initial_config.suggested_section_id]);

  const approvedDrafts = drafts.filter(d => statuses[d.gen_id] === "approved");

  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      setError("Vui lòng nhập tên Quiz.");
      return;
    }
    if (approvedDrafts.length === 0) {
      setError("Vui lòng phê duyệt ít nhất 1 câu hỏi.");
      return;
    }
    if (!selectedSectionId && selectedSectionId !== NEW_SECTION_VALUE) {
        setError("Vui lòng chọn hoặc tạo mới một chương.");
        return;
    }

    setIsSaving(true);
    setError(null);
    try {
      let finalSectionId = selectedSectionId;

      // 1. Create new section if needed
      if (selectedSectionId === NEW_SECTION_VALUE) {
        setSaveStep("Đang tạo chương mới...");
        const sectionResp = await lmsService.createSection(course_id, {
          title: newSectionTitle.trim() || `Chương mới cho ${title}`,
          order_index: sections.length + 1
        });
        if (sectionResp.data?.id) {
          finalSectionId = sectionResp.data.id;
        } else {
            throw new Error("Không thể tạo chương mới.");
        }
      }

      // 2. Create Section Content (type QUIZ)
      setSaveStep("Đang tạo mục Quiz trong chương...");
      // For order_index, we just append to the list of content in that section
      const contentList = await lmsService.listContent(finalSectionId);
      const nextOrder = (contentList.data?.length || 0) + 1;

      const contentResp = await lmsService.createContent(finalSectionId, {
        type: "QUIZ",
        title: title.trim(),
        description: description.trim(),
        order_index: nextOrder,
        is_mandatory: true
      });
      const contentId = contentResp.data?.id;
      if (!contentId) throw new Error("Không thể tạo nội dung Quiz.");

      // 3. Create Quiz Activity
      setSaveStep("Đang cấu hình Quiz...");
      const quizResp = await quizService.createQuiz({
        content_id: contentId,
        title: title.trim(),
        description: description.trim(),
        time_limit_minutes: duration,
        max_attempts: 3,
        passing_score: 80,
        total_points: approvedDrafts.length * 10
      });
      const quizId = quizResp.data?.id;
      if (!quizId) throw new Error("Không thể khởi tạo Quiz Activity.");

      // 4. Create Questions
      setSaveStep(`Đang tạo ${approvedDrafts.length} câu hỏi...`);
      let questionOrder = 1;
      for (const draft of approvedDrafts) {
        await quizService.createQuestion(quizId, {
          question_text: draft.question_text,
          question_type: draft.question_type || "SINGLE_CHOICE",
          explanation: draft.explanation || "",
          points: 10,
          order_index: questionOrder++,
          answer_options: getAnswerOptions(draft.answer_options).map((opt: any, index: number) => ({
            option_text: opt.text || opt.option_text || "",
            is_correct: !!opt.is_correct,
            order_index: index + 1
          }))
        });
      }

      setSaveStep("Hoàn tất!");
      setSuccess(true);
    } catch (err: any) {
      console.error("Save Quiz failed:", err);
      setError(err?.response?.data?.message || err.message || "Lỗi không xác định khi lưu Quiz.");
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 rounded-2xl bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Quiz đã sẵn sàng!</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Đã tạo thành công quiz &quot;{title}&quot; với {approvedDrafts.length} câu hỏi.
        </p>
        <button 
          onClick={() => window.location.reload()} // Optional: refresh or redirect
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
        >
          Xem trong khóa học
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Configuration Header ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cấu hình Quiz Activity</h2>
            <p className="text-xs text-slate-500">Thiết lập các thông số cơ bản cho bài kiểm tra.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Tên bài kiểm tra</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề quiz..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Thời gian (phút)</label>
            <div className="relative">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Chọn Chương (Section)</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value={0} disabled>-- Chọn chương --</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.title} {s.id === initial_config.suggested_section_id ? "(Gợi ý)" : ""}</option>
              ))}
              <option value={NEW_SECTION_VALUE}>+ Tạo chương mới...</option>
            </select>
          </div>

          {selectedSectionId === NEW_SECTION_VALUE && (
            <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Tên chương mới</label>
              <div className="relative">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra cuối khóa, Chương 10..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <Plus className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Question Review ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Duyệt câu hỏi</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                {approvedDrafts.length}/{drafts.length}
            </span>
          </div>
          <button 
            onClick={() => {
                const allApproved: Record<number, "approved"> = {};
                drafts.forEach(d => allApproved[d.gen_id] = "approved");
                setStatuses(allApproved);
            }}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Duyệt tất cả
          </button>
        </div>

        {drafts.map((d) => {
          const status = statuses[d.gen_id] || "pending";
          const isExpanded = expanded === d.gen_id;

          return (
            <div
              key={d.gen_id}
              className={cn(
                "rounded-2xl border p-4 transition-all duration-200 group",
                status === "approved"
                  ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10"
                  : status === "rejected"
                    ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10 opacity-60"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider",
                        BLOOM_COLORS[d.bloom_level] || BLOOM_COLORS.remember,
                      )}
                    >
                      {d.bloom_level}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {d.question_text}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setStatuses(s => ({...s, [d.gen_id]: "approved"}))}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90",
                      status === "approved" 
                        ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30"
                    )}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setStatuses(s => ({...s, [d.gen_id]: "rejected"}))}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90",
                      status === "rejected"
                        ? "bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setExpanded(isExpanded ? null : d.gen_id)}
                className="mt-3 text-[11px] font-semibold text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1.5"
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {isExpanded ? "ẨN ĐÁP ÁN" : "XEM ĐÁP ÁN"}
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in slide-in-from-top-1">
                  {getAnswerOptions(d.answer_options).map((opt: any, i: number) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
                        opt.is_correct
                          ? "bg-green-500/10 text-green-700 dark:text-green-300 font-medium border border-green-200/50 dark:border-green-800/30"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <span className="flex-shrink-0 w-5 text-center">{String.fromCharCode(65 + i)}.</span>
                      <span className="flex-1">{opt.text}</span>
                      {opt.is_correct && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="pt-4 sticky bottom-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50 dark:via-slate-950 to-transparent pb-2">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in shake duration-500">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleSaveQuiz}
          disabled={isSaving}
          className={cn(
            "w-full h-14 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
            isSaving 
                ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{saveStep}</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Tạo & Lưu Quiz vào LMS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
