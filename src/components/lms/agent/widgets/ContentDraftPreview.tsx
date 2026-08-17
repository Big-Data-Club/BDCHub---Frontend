"use client";

import { useState, useEffect } from "react";
import { Edit2, Check, Save, FileText, ChevronDown, PlusCircle, Sparkles } from "lucide-react";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import lmsService from "@/services/lmsService";
import { toast } from "react-hot-toast";

interface LearningDesign {
  objectives?: string[];
  prerequisites?: string[];
  chosen_approach?: string;
  practice_type?: string;
  extension_prompt?: string;
  research_directions?: string[];
  evidence_limits?: string[];
}

interface ContentDraftPreviewProps {
  props: {
    content_type: string;
    topic: string;
    title?: string;
    description?: string;
    draft: string;
    learning_design?: LearningDesign;
    teacher_requirements?: string;
    source_was_reduced?: boolean;
    course_id?: number | null;
    suggested_section_id?: number | null;
  };
}

const NEW_SECTION_VALUE = -99;

const contentTypeLabels: Record<string, string> = {
  student_lesson: "Bài học cho học viên",
  lesson_plan: "Kế hoạch giảng dạy",
  slide_structure: "Cấu trúc slide",
  outline: "Dàn ý",
  summary: "Tóm tắt",
  explanation: "Giải thích",
};

export function ContentDraftPreview({ props }: ContentDraftPreviewProps) {
  const { content_type, topic, draft: initialDraft, course_id, suggested_section_id, source_was_reduced, learning_design } = props;
  const [draft, setDraft] = useState(initialDraft);
  const [title, setTitle] = useState(props.title || topic);
  const [description, setDescription] = useState(
    props.description || `Nội dung AI tạo có thể chỉnh sửa về ${topic}`,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">(course_id || "");
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | "">("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const resp = await lmsService.listMyCourses();
        const courseList = resp?.items || [];
        setCourses(Array.isArray(courseList) ? courseList : []);
        
        if (!selectedCourseId && Array.isArray(courseList) && courseList.length > 0) {
          setSelectedCourseId(courseList[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedCourseId) {
        setSections([]);
        return;
      }
      try {
        const resp = await lmsService.listSections(Number(selectedCourseId));
        const sectionList = resp.data || [];
        setSections(sectionList);
        
        // Auto-select suggested section if provided and matches the suggested course
        if (selectedCourseId === course_id && suggested_section_id && sectionList.some((s: any) => s.id === suggested_section_id)) {
          setSelectedSectionId(suggested_section_id);
        } else if (sectionList.length > 0) {
          setSelectedSectionId(sectionList[0].id);
        } else {
          setSelectedSectionId(NEW_SECTION_VALUE);
        }
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      }
    };
    fetchSections();
  }, [selectedCourseId, course_id, suggested_section_id]);

  const handleSaveToLms = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng đặt tiêu đề trước khi lưu.");
      return;
    }
    if (!selectedCourseId) {
      toast.error("Vui lòng chọn một khóa học.");
      return;
    }

    if (!selectedSectionId) {
      toast.error("Vui lòng chọn hoặc tạo một chương để lưu.");
      return;
    }

    if (selectedSectionId === NEW_SECTION_VALUE && !newSectionTitle.trim()) {
      toast.error("Vui lòng nhập tên chương mới.");
      return;
    }

    setIsSaving(true);
    try {
      let finalSectionId = Number(selectedSectionId);

      // 1. Create section if needed
      if (selectedSectionId === NEW_SECTION_VALUE) {
        const sectionResp = await lmsService.createSection(Number(selectedCourseId), {
          title: newSectionTitle.trim(),
          order_index: sections.length + 1
        });
        if (sectionResp.data?.id) {
          finalSectionId = sectionResp.data.id;
        } else {
          throw new Error("Không thể tạo chương mới.");
        }
      }

      // 2. Find the next order index
      const existingContent = await lmsService.listContent(finalSectionId);
      const orderIndex = (existingContent.data?.length || 0) + 1;

      // 3. Create content
      await lmsService.createContent(finalSectionId, {
        type: "TEXT",
        title: title.trim(),
        description: description.trim(),
        order_index: orderIndex,
        metadata: {
          content: draft,
          is_ai_generated: true,
          generated_topic: topic,
          learning_design: learning_design || {},
        }
      });

      toast.success("Đã lưu nội dung thành công!");
      setIsSaved(true);
    } catch (err: any) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full my-3">
      {/* Header */}
      <div className="py-2 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
              {contentTypeLabels[content_type] || content_type.replace("_", " ")}
            </h3>
            {source_was_reduced && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Đã tổng hợp toàn bộ tài liệu nguồn theo từng phần
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            isEditing
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
          {isEditing ? "Hoàn tất" : "Sửa bản nháp"}
        </button>
      </div>

      {/* Learning contract: exposes the model's pedagogical choices so a
          teacher can review the why, not just the generated prose. */}
      {content_type === "student_lesson" && learning_design && (
        <div className="py-2 mb-3 text-xs border-l-2 border-blue-500/30 pl-3">
          <div className="flex flex-wrap gap-2 text-slate-600 dark:text-slate-300">
            {learning_design.chosen_approach && <span className="rounded-md bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 text-xs">Cách học: {learning_design.chosen_approach}</span>}
            {learning_design.practice_type && <span className="rounded-md bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 text-xs">Thực hành: {learning_design.practice_type}</span>}
          </div>
          {(learning_design.objectives?.length || learning_design.prerequisites?.length) ? (
            <div className="mt-1.5 space-y-0.5 text-slate-500 dark:text-slate-400 text-xs">
              {learning_design.objectives?.length ? <p><span className="font-semibold">Mục tiêu:</span> {learning_design.objectives.join(" · ")}</p> : null}
              {learning_design.prerequisites?.length ? <p><span className="font-semibold">Nền tảng:</span> {learning_design.prerequisites.join(" · ")}</p> : null}
            </div>
          ) : null}
        </div>
      )}

      {/* Content Area */}
      <div className="py-1">
        {isEditing ? (
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Tiêu đề bài học"
              className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Mô tả bài học"
              className="w-full h-16 p-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-y"
            />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-[300px] p-4 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
            />
          </div>
        ) : (
          <>
            <h4 className="mb-1 text-base font-bold text-slate-900 dark:text-white">{title}</h4>
            {description && <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
            <MarkdownRenderer content={draft} />
          </>
        )}
      </div>

      {/* Footer / Actions */}
      {!isSaved && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0F1E35] border border-slate-200/80 dark:border-blue-500/15 space-y-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <div className="relative w-full sm:w-1/2">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all"
                >
                  <option value="" disabled>Chọn khóa học...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id === course_id ? "✨ " : ""} Khóa học: {c.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="relative w-full sm:w-1/2">
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                  disabled={!selectedCourseId}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all disabled:opacity-50"
                >
                  <optgroup label="Chương hiện có">
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id === suggested_section_id && selectedCourseId === course_id ? "✨ " : ""} Chương: {s.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tùy chọn khác">
                    <option value={NEW_SECTION_VALUE}>+ Tạo chương mới...</option>
                  </optgroup>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {selectedSectionId !== NEW_SECTION_VALUE && suggested_section_id && selectedCourseId === course_id && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/10 rounded-full w-max">
                <Sparkles size={12} className="text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">AI Suggested Location</span>
              </div>
            )}
          </div>

          {selectedSectionId === NEW_SECTION_VALUE && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Nhập tên chương mới..."
                className="w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-900/50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm shadow-blue-500/5"
                autoFocus
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveToLms}
              disabled={isSaving || (!selectedSectionId && selectedSectionId !== NEW_SECTION_VALUE)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {selectedSectionId === NEW_SECTION_VALUE ? "Create & Save" : "Approve & Save"}
            </button>
          </div>
        </div>
      )}

      {isSaved && (
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-green-50 dark:bg-green-900/10 text-center">
          <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
            <Check size={16} /> Đã hoàn tất lưu nội dung vào LMS.
          </p>
        </div>
      )}
    </div>
  );
}
