"use client";

import React, { useState } from "react";
import { 
  Tv, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  Video,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info
} from "lucide-react";
import { useVideoJobs } from "@/hooks/useVideoJobs";
import VideoJobCard from "./VideoJobCard";

interface VideoGenPanelProps {
  courseId: number;
  targetType?: "course" | "section";
  targetId?: number;
}

export default function VideoGenPanel({ 
  courseId, 
  targetType = "course", 
  targetId 
}: VideoGenPanelProps) {
  // Resolve true target
  const finalTargetId = targetId ?? courseId;
  
  const {
    jobs,
    loading,
    error: jobError,
    isCreating,
    createJob,
    publishJob,
    refresh
  } = useVideoJobs(targetType, finalTargetId);

  const [customPrompt, setCustomPrompt] = useState("");
  const [language, setLanguage] = useState("vi");
  const [templateType, setTemplateType] = useState("dark");
  const [showConfig, setShowConfig] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createJob(customPrompt, language, templateType);
      // Reset prompt field on success
      setCustomPrompt("");
    } catch (err: any) {
      setActionError(err.message || "Failed to start video generation");
    }
  };

  const activeJobs = jobs.filter(j => 
    ["PENDING", "PLANNING", "SCRIPTING", "RENDERING", "UPLOADING", "PUBLISHING"].includes(j.status)
  );
  
  const isLimitReached = activeJobs.length >= 2;
  const displayError = actionError || jobError;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-4">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            Dựng Video Giới thiệu Khóa học Tự động
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Sử dụng Multi-Agent AI kết hợp dữ liệu sơ đồ kiến thức (Knowledge Graph) để sinh kịch bản giáo trình, thu âm giọng đọc và dựng video giới thiệu sinh động hoàn toàn tự động.
          </p>
        </div>
        <div className="flex shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
            <div className="text-2xl font-black text-indigo-300">{activeJobs.length}/2</div>
            <div className="text-xxs uppercase tracking-wider text-slate-400">Tiến trình chạy song song</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Generation Input Panel (Left Column) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
            <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Yêu cầu Dựng Video
          </h3>

          {displayError && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400 leading-normal">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            {/* Custom Instructions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Yêu cầu bổ sung (Optional)
                <div className="relative">
                  <HelpCircle 
                    className="w-3.5 h-3.5 hover:text-indigo-600 cursor-pointer" 
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  />
                  {showTooltip && (
                    <div className="absolute left-5 top-0 z-10 w-60 p-2 text-xxs font-normal bg-slate-800 text-white rounded shadow-md border border-slate-700">
                      Gợi ý: &quot;Nhấn mạnh các khái niệm chính trong Big Data&quot; hoặc &quot;Sử dụng giọng văn vui nhộn, lôi cuốn&quot;.
                    </div>
                  )}
                </div>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                maxLength={5000}
                placeholder="Ví dụ: Tập trung giới thiệu về tính ứng dụng thực tiễn của khóa học, giọng văn chuyên nghiệp..."
                className="w-full h-24 p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              <div className="flex justify-end text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                {customPrompt.length}/5000
              </div>
            </div>

            {/* Advanced configurations toggle */}
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold self-start"
            >
              Cấu hình nâng cao {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showConfig && (
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-lg border border-slate-100 dark:border-slate-850/80 flex flex-col gap-3.5">
                {/* Language Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ngôn ngữ thuyết minh</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="p-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-100"
                  >
                    <option value="vi">Tiếng Việt (Mặc định)</option>
                    <option value="en">English (Tiếng Anh)</option>
                  </select>
                </div>

                {/* Template Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Giao diện slide ảnh</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="p-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-100"
                  >
                    <option value="dark">Tông màu tối (Premium Dark)</option>
                    <option value="light">Tông màu sáng (Corporate Light)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Generation Button */}
            <button
              type="submit"
              disabled={isCreating || isLimitReached}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-650 rounded-lg shadow-sm transition"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang khởi tạo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Bắt đầu dựng video
                </>
              )}
            </button>

            {isLimitReached && (
              <p className="text-xxs text-amber-600 dark:text-amber-400 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Giới hạn tạo song song đã đầy (tối đa 2). Hãy đợi job hiện tại hoàn thành.
              </p>
            )}
          </form>
        </div>

        {/* Video Jobs History (Right Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              Lịch sử tạo Video ({jobs.length})
            </h3>
            <button
              onClick={refresh}
              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition"
              title="Làm mới trạng thái"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-2" />
              <p className="text-xs text-slate-400">Đang tải lịch sử dựng video...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 bg-slate-50/20">
              <Tv className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chưa có video giới thiệu nào</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Khóa học hoặc Chương học này chưa từng được dựng video giới thiệu. Nhập nội dung ở cột bên trái để dựng ngay!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <VideoJobCard 
                  key={job.id} 
                  job={job} 
                  onPublish={publishJob} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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
