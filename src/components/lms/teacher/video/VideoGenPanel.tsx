"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { 
  Tv, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  Video,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  BookOpen,
  Layers,
  Settings,
  Film,
  FileVideo,
  CheckCircle2
} from "lucide-react";
import { useVideoJobs } from "@/hooks/useVideoJobs";
import VideoJobCard from "./VideoJobCard";
import lmsService from "@/services/lmsService";
import type { Section } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface VideoGenPanelProps {
  courseId: number;
  targetType?: "course" | "section";
  targetId?: number;
}

export default function VideoGenPanel({ 
  courseId, 
  targetType: initialTargetType = "course", 
  targetId: initialTargetId 
}: VideoGenPanelProps) {
  // Navigation & Scope States
  const [generationScope, setGenerationScope] = useState<"course" | "section">(initialTargetType);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [loadingSections, setLoadingSections] = useState(true);

  // Configuration States
  const [customPrompt, setCustomPrompt] = useState("");
  const [language, setLanguage] = useState("vi");
  const [templateType, setTemplateType] = useState("dark");
  const [showConfig, setShowConfig] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Load course sections
  useEffect(() => {
    let active = true;
    const loadSections = async () => {
      try {
        setLoadingSections(true);
        const res = await lmsService.listSections(courseId);
        const sectionsList = res?.data || [];
        if (active) {
          setSections(sectionsList);
          if (sectionsList.length > 0) {
            setSelectedSectionId(sectionsList[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load course sections:", err);
      } finally {
        if (active) setLoadingSections(false);
      }
    };
    loadSections();
    return () => {
      active = false;
    };
  }, [courseId]);

  // Dynamically resolve target parameters based on scope selection
  const activeTargetType = generationScope;
  const activeTargetId = generationScope === "course" 
    ? courseId 
    : (selectedSectionId ?? (sections[0]?.id || 0));

  // Connect to the video jobs hook
  const {
    jobs,
    loading,
    error: jobError,
    isCreating,
    createJob,
    publishJob,
    refresh
  } = useVideoJobs(activeTargetType, activeTargetId);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      if (generationScope === "section" && !selectedSectionId) {
        throw new Error("Vui lòng chọn chương học để dựng video!");
      }
      await createJob(customPrompt, language, templateType);
      setCustomPrompt("");
    } catch (err: any) {
      setActionError(err.message || "Không thể khởi động tiến trình dựng video.");
    }
  };

  const activeJobs = jobs.filter(j => 
    ["PENDING", "PLANNING", "SCRIPTING", "RENDERING", "UPLOADING", "PUBLISHING"].includes(j.status)
  );
  
  const isLimitReached = activeJobs.length >= 2;
  const displayError = actionError || jobError;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 max-w-5xl mx-auto py-2"
    >
      {/* Flat Header Panel */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-100 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 tracking-tight text-slate-900 dark:text-white">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse shrink-0" />
              Dựng Video Tổng Quan Tự Động
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed font-normal">
              Sử dụng Multi-Agent AI kết hợp dữ liệu sơ đồ kiến thức (Knowledge Graph) để sinh kịch bản giáo trình, thu âm giọng đọc và dựng video giới thiệu sinh động hoàn toàn tự động cho Khóa học hoặc từng Chương học của bạn.
            </p>
          </div>
          <div className="flex shrink-0">
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-inner min-w-36">
              <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400">{activeJobs.length}/2</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Job chạy song song</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector Tabs */}
      <div className="bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 flex gap-2 w-full max-w-md mx-auto">
        <button
          onClick={() => setGenerationScope("course")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition duration-200 ${
            generationScope === "course"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-650 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-900/50"
          }`}
        >
          <Tv className="w-4 h-4" />
          Tổng quan Khóa học
        </button>
        <button
          onClick={() => {
            setGenerationScope("section");
            if (sections.length > 0 && selectedSectionId === null) {
              setSelectedSectionId(sections[0].id);
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition duration-200 ${
            generationScope === "section"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-650 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-900/50"
          }`}
        >
          <Layers className="w-4 h-4" />
          Từng Chương học (Section)
        </button>
      </div>

      {/* Section Cards Panel (Animate-In if Scope is Section) */}
      <AnimatePresence mode="wait">
        {generationScope === "section" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Chọn chương học để thiết lập video:
                </h4>
                {sections.length > 0 && (
                  <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-200/50 dark:border-indigo-900/40">
                    Tổng số {sections.length} chương
                  </span>
                )}
              </div>

              {loadingSections ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                  Đang tải danh sách chương học...
                </div>
              ) : sections.length === 0 ? (
                <div className="py-6 text-center text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/5 dark:bg-amber-950/10 rounded-xl border border-dashed border-amber-200 dark:border-amber-900/40">
                  ⚠️ Chưa có chương học nào được tạo trong khóa học này. Hãy thêm chương học trước!
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-4 py-2.5 px-0.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {sections.map((section, idx) => {
                    const isSelected = selectedSectionId === section.id;
                    return (
                      <motion.div
                        key={section.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSectionId(section.id)}
                        className={`w-60 shrink-0 p-4 rounded-xl cursor-pointer border transition-all duration-200 relative ${
                          isSelected
                            ? "bg-indigo-50/20 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/10 dark:ring-indigo-400/5"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          Chương {idx + 1}
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                          {section.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {section.description || "Không có mô tả chi tiết."}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Generation Input Panel (Left Column) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-md">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Cấu hình Video {generationScope === "course" ? "Khóa học" : "Chương học"}
          </h3>

          {displayError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400 leading-normal font-medium">{displayError}</p>
            </motion.div>
          )}

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            {/* Custom Instructions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Yêu cầu bổ sung cho AI (Tùy chọn)
                <div className="relative">
                  <HelpCircle 
                    className="w-3.5 h-3.5 hover:text-indigo-650 cursor-pointer text-slate-400" 
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  />
                  {showTooltip && (
                    <div className="absolute left-5 top-0 z-20 w-60 p-2.5 text-[10px] font-normal bg-slate-800 text-slate-100 rounded-lg shadow-xl border border-slate-700 leading-normal">
                      Ví dụ: &quot;Nhấn mạnh các khái niệm chính trong Big Data&quot; hoặc &quot;Sử dụng giọng văn vui nhộn, lôi cuốn, tạo động lực cho sinh viên học&quot;.
                    </div>
                  )}
                </div>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                maxLength={5000}
                placeholder={
                  generationScope === "course"
                    ? "Ví dụ: Tập trung giới thiệu các khái niệm thực tế của giáo trình, giọng điệu chuyên nghiệp..."
                    : "Ví dụ: Phân tích sâu các khái niệm lý thuyết trong chương này, nhấn mạnh bài tập thực hành..."
                }
                className="w-full h-28 p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850 dark:text-slate-100 placeholder:text-slate-400"
              />
              <div className="flex justify-end text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {customPrompt.length}/5000 ký tự
              </div>
            </div>

            {/* Advanced configurations toggle */}
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold self-start"
            >
              <Settings className="w-3.5 h-3.5" />
              Cấu hình nâng cao {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showConfig && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col gap-3.5"
              >
                {/* Language Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Ngôn ngữ thuyết minh</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="p-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="vi">Tiếng Việt (Mặc định)</option>
                    <option value="en">English (Tiếng Anh)</option>
                  </select>
                </div>

                {/* Template Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Giao diện thiết kế Slide</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="p-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="dark">Tông màu tối (Premium Dark)</option>
                    <option value="light">Tông màu sáng (Corporate Light)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Generation Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isCreating || isLimitReached || (generationScope === "section" && sections.length === 0)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-650 rounded-xl shadow-md hover:shadow-lg transition duration-200"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang khởi tạo job AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Bắt đầu dựng video
                </>
              )}
            </motion.button>

            {isLimitReached && (
              <p className="text-xxs text-amber-600 dark:text-amber-400 flex items-start gap-1 leading-normal font-medium bg-amber-500/5 p-2.5 rounded-lg border border-amber-250/20">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-550" />
                Giới hạn job song song đã đầy (tối đa 2). Hãy đợi job hiện tại hoàn thành trước khi bắt đầu dựng video mới.
              </p>
            )}
          </form>
        </div>

        {/* Video Jobs History (Right Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-500" />
              Lịch sử Dựng Video {generationScope === "course" ? "Khóa học" : "Chương học"} ({jobs.length})
            </h3>
            <button
              onClick={refresh}
              className="p-2 text-slate-500 hover:text-indigo-650 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition duration-200"
              title="Làm mới trạng thái"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-medium">Đang tải danh sách tác vụ từ hệ thống...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 bg-slate-50/10">
              <FileVideo className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3.5" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có video giới thiệu nào</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {generationScope === "course"
                  ? "Khóa học này chưa từng được dựng video giới thiệu tổng quan. Hãy điền yêu cầu ở cột bên trái để AI tiến hành dựng video!"
                  : "Chương học này chưa từng được dựng video. Chọn chương học ở trên và điền mô tả ở cột bên trái để dựng ngay!"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <VideoJobCard 
                      job={job} 
                      onPublish={publishJob} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Simple loader helper
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
