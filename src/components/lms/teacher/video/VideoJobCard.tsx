"use client";

import React, { useState } from "react";
import { 
  Tv, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Globe, 
  Lock, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  Clock,
  FileText,
  Info
} from "lucide-react";
import type { VideoJob } from "@/types";

interface VideoJobCardProps {
  job: VideoJob;
  onPublish: (jobId: string) => Promise<void>;
}

export default function VideoJobCard({ job, onPublish }: VideoJobCardProps) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          label: "Đang chờ",
          icon: <Clock className="w-4 h-4 animate-pulse" />
        };
      case "PLANNING":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/30",
          text: "text-purple-700 dark:text-purple-400",
          border: "border-purple-200 dark:border-purple-800",
          label: "Lập kế hoạch",
          icon: <Loader2 className="w-4 h-4 animate-spin" />
        };
      case "SCRIPTING":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          text: "text-blue-700 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800",
          label: "Viết kịch bản",
          icon: <FileText className="w-4 h-4" />
        };
      case "RENDERING":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/30",
          text: "text-indigo-700 dark:text-indigo-400",
          border: "border-indigo-200 dark:border-indigo-800",
          label: "Đang dựng video",
          icon: <Loader2 className="w-4 h-4 animate-spin" />
        };
      case "UPLOADING":
        return {
          bg: "bg-pink-50 dark:bg-pink-950/30",
          text: "text-pink-700 dark:text-pink-400",
          border: "border-pink-200 dark:border-pink-800",
          label: "Đang tải lên YouTube",
          icon: <Loader2 className="w-4 h-4 animate-spin" />
        };
      case "COMPLETED":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800",
          label: "Đang chờ duyệt",
          icon: <Lock className="w-4 h-4" />
        };
      case "PUBLISHING":
        return {
          bg: "bg-orange-50 dark:bg-orange-950/30",
          text: "text-orange-700 dark:text-orange-400",
          border: "border-orange-200 dark:border-orange-800",
          label: "Đang xuất bản",
          icon: <Loader2 className="w-4 h-4 animate-spin" />
        };
      case "PUBLIC":
      case "COMPLETED_PUBLIC": // fallback check
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800",
          label: "Công khai",
          icon: <Globe className="w-4 h-4" />
        };
      case "FAILED":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-800",
          label: "Thất bại",
          icon: <AlertTriangle className="w-4 h-4" />
        };
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          label: status,
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const statusConfig = getStatusConfig(job.status);
  const isFinished = ["COMPLETED", "PUBLIC", "PUBLISHING"].includes(job.status);
  const isPending = ["PENDING", "PLANNING", "SCRIPTING", "RENDERING", "UPLOADING"].includes(job.status);

  const handleCopyLink = () => {
    if (job.youtube_url) {
      navigator.clipboard.writeText(job.youtube_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onPublish(job.id);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const formattedDate = new Date(job.created_at).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
      {/* Visual Header */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ID: {job.id.substring(0, 8)}...
            </span>
          </div>
          
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2 line-clamp-1">
            {job.custom_prompt ? `Mô tả: "${job.custom_prompt}"` : "Video giới thiệu tự động"}
          </h4>
          <p className="text-xs text-slate-400 mt-1">Khởi tạo lúc: {formattedDate}</p>
        </div>

        {/* Action Controls */}
        {job.status === "COMPLETED" && job.visibility === "unlisted" && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm hover:shadow transition duration-200 w-full md:w-auto"
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            Công khai lên khóa học
          </button>
        )}

        {job.status === "PUBLIC" && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
            <CheckCircle className="w-4 h-4" /> Đã công khai trên khóa học
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Active Progress State */}
        {isPending && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin absolute" />
              <Tv className="w-5 h-5 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Hệ thống AI đang xử lý ({job.progress}%)
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Quy trình: Phân tích tài liệu → Lên bố cục → Viết kịch bản → Kết xuất giọng nói & ảnh → Tạo video MP4.
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${job.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Failed State */}
        {job.status === "FAILED" && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold text-red-800 dark:text-red-300">Lỗi tạo video</h5>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                {job.last_error_message || "Đã xảy ra lỗi không xác định trong quá trình dựng video."}
              </p>
            </div>
          </div>
        )}

        {/* Publishing State */}
        {job.status === "PUBLISHING" && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin absolute" />
              <Globe className="w-5 h-5 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Đang xuất bản lên YouTube...
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Hệ thống đang tải video lên YouTube và cấu hình hiển thị công khai. Quá trình này có thể mất vài phút.
            </p>
          </div>
        )}

        {/* Render Preview HTML5 Video Player */}
        {job.status === "COMPLETED" && (
          <div className="flex flex-col gap-3">
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-950 flex items-center justify-center">
              <video
                src={job.preview_url || `/files/video-previews/vid_${job.id}.mp4`}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
                controlsList="nodownload"
              />
            </div>
            
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/55 dark:border-amber-900/40 rounded-lg flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xxs text-amber-700 dark:text-amber-400 leading-relaxed font-normal">
                Đây là video xem trước được lưu trữ tạm thời trong 10 phút. Bạn có thể nhấn <strong>&quot;Công khai lên khóa học&quot;</strong> để xuất bản chính thức lên YouTube. Sau 10 phút, nếu không được xuất bản, bản xem trước tạm thời sẽ tự động bị xóa.
              </div>
            </div>
          </div>
        )}

        {/* Render Completed YouTube Player */}
        {job.status === "PUBLIC" && job.youtube_video_id && (
          <div className="flex flex-col gap-3">
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-950">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${job.youtube_video_id}?rel=0&modestbranding=1`}
                title={job.custom_prompt || "Course Overview Video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Sharing & Links bar */}
            <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                {job.visibility === "public" ? (
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>Trạng thái: <strong className="capitalize">{job.visibility} (YouTube)</strong></span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Đã copy!" : "Copy link"}
                </button>
                <a
                  href={job.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Xem trên YT
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* Additional job metadata */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-500 dark:text-slate-400">
          <div>Ngôn ngữ: <strong className="uppercase">{job.language}</strong></div>
          <div>Chủ đề ảnh: <strong className="capitalize">{job.template_type === "dark" ? "Giao diện tối (Dark)" : "Giao diện sáng (Light)"}</strong></div>
        </div>
      </div>
    </div>
  );
}
