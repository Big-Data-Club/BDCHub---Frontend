"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit2, Check, Save, FileText, ChevronDown, PlusCircle, Sparkles } from "lucide-react";
import lmsService from "@/services/lmsService";
import { toast } from "react-hot-toast";

interface ContentDraftPreviewProps {
  props: {
    content_type: string;
    topic: string;
    draft: string;
    course_id?: number | null;
    suggested_section_id?: number | null;
  };
}

const NEW_SECTION_VALUE = -99;

export function ContentDraftPreview({ props }: ContentDraftPreviewProps) {
  const { content_type, topic, draft: initialDraft, course_id, suggested_section_id } = props;
  const [draft, setDraft] = useState(initialDraft);
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
        const courseList = resp.data || [];
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
        title: `${content_type.charAt(0).toUpperCase() + content_type.slice(1)}: ${topic}`,
        description: `AI-generated ${content_type} about ${topic}`,
        order_index: orderIndex,
        metadata: {
          content: draft,
          is_ai_generated: true,
          generated_topic: topic
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
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {content_type.replace("_", " ")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {topic}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isEditing
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {isEditing ? <Check size={14} /> : <Edit2 size={14} />}
          {isEditing ? "Finish" : "Edit Draft"}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 max-h-[400px] overflow-y-auto custom-scrollbar">
        {isEditing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full h-[300px] p-4 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      {!isSaved && (
        <div className="px-5 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 space-y-4">
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
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">AI Suggested Location</span>
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
