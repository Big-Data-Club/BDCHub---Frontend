"use client";

import { ContentItem, EmptyState, extractYouTubeId, extractVimeoId, buildFileUrl, DownloadLink } from "./utils";

interface VideoRendererProps {
  content: ContentItem;
}

export function VideoRenderer({ content }: VideoRendererProps) {
  const videoUrl = content.metadata?.video_url || content.metadata?.url || "";

  if (!videoUrl) {
    return (
      <EmptyState message="Video chưa được cấu hình." />
    );
  }

  const youtubeId = extractYouTubeId(videoUrl);
  if (youtubeId) {
    return (
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-sm bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={content.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const vimeoId = extractVimeoId(videoUrl);
  if (vimeoId) {
    return (
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-sm bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title={content.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Native video file
  const filePath = content.metadata?.file_path || content.file_path;
  const fileUrl = buildFileUrl(filePath);
  if (fileUrl) {
    return (
      <div className="space-y-3">
        <video
          controls
          className="w-full rounded-2xl shadow-sm bg-black"
          src={fileUrl}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
        <DownloadLink href={fileUrl.replace("/serve/", "/download/")} label="Tải xuống video" />
      </div>
    );
  }

  return <EmptyState message="Định dạng video không được hỗ trợ." />;
}
