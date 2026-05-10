"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import YouTubeVideoUpload from "@/components/lms/teacher/upload/YoutubeVideoUpload";
import { FileInfo } from "@/types";
import type { ContentFormProps } from "@/types";
import { cn } from "@/lib/utils";

type UploadMethod = "youtube" | "server" | "url";

const METHOD_TABS: { id: UploadMethod; label: string; emoji: string }[] = [
  { id: "youtube", label: "YouTube",  emoji: "📺" },
  { id: "server",  label: "Server",   emoji: "💾" },
  { id: "url",     label: "URL",      emoji: "🔗" },
];

/**
 * VideoContentForm
 *
 * Three upload methods selectable via a segmented control:
 *   - YouTube  (recommended – uses YouTubeVideoUpload component)
 *   - Server   (direct upload to LMS file storage)
 *   - URL      (embed an external video URL)
 */
export function VideoContentForm({ formData, onChange, onFileUploaded, disabled }: ContentFormProps) {
  const [method, setMethod]     = useState<UploadMethod>("youtube");
  const [videoUrl, setVideoUrl] = useState("");

  const uploaded = formData.metadata?.file_path || formData.metadata?.video_url;

  const handleFileUploaded = (fileInfo: FileInfo) => {
    onFileUploaded(fileInfo);
    const meta: Record<string, any> = {
      file_path:  fileInfo.file_path,
      file_name:  fileInfo.file_name,
      file_size:  fileInfo.file_size,
      file_id:    fileInfo.file_id,
    };
    if ((fileInfo as any).video_type === "youtube") {
      meta.video_type = "youtube";
      meta.video_url  = (fileInfo as any).video_url;
      meta.embed_url  = (fileInfo as any).embed_url;
      meta.thumbnail_url = (fileInfo as any).thumbnail_url;
    }
    onChange({ metadata: meta });
    if (!formData.title) onChange({ title: fileInfo.file_name });
  };

  const handleUrlCommit = () => {
    if (!videoUrl.trim()) return;
    onChange({
      metadata: { ...formData.metadata, video_url: videoUrl.trim(), video_type: "external" },
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload method selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Phương thức upload
        </label>
        <div className="flex gap-2">
          {METHOD_TABS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              disabled={disabled}
              className={cn(
                "flex-1 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all active:scale-95",
                method === m.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600"
              )}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Method content */}
      {method === "youtube" && (
        <YouTubeVideoUpload onFileUploaded={handleFileUploaded} disabled={disabled} />
      )}

      {method === "server" && (
        <FileUpload fileType="video" onFileUploaded={handleFileUploaded} />
      )}

      {method === "url" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            URL video
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              disabled={disabled}
              placeholder="https://youtube.com/watch?v=… hoặc https://example.com/video.mp4"
              className="
                flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100
                placeholder:text-slate-400 dark:placeholder:text-slate-600
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                transition-all
              "
            />
            <button
              type="button"
              onClick={handleUrlCommit}
              disabled={disabled || !videoUrl.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium active:scale-95 transition-all disabled:opacity-50"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* Success indicator */}
      {uploaded && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              Đã upload thành công
            </p>
            {formData.metadata?.file_name && (
              <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                {formData.metadata.file_name}
              </p>
            )}
            {formData.metadata?.video_url && (
              <p className="text-xs text-green-600 dark:text-green-500 mt-0.5 truncate max-w-sm">
                {formData.metadata.video_url}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
