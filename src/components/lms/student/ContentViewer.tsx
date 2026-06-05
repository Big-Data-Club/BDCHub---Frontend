"use client";

import { ContentItem, CompletionBadge, EmptyState } from "./content-renderers/utils";
import { TextRenderer } from "./content-renderers/TextRenderer";
import { VideoRenderer } from "./content-renderers/VideoRenderer";
import { ImageRenderer } from "./content-renderers/ImageRenderer";
import { DocumentRenderer } from "./content-renderers/DocumentRenderer";
import { QuizRenderer } from "./content-renderers/QuizRenderer";
import { ForumRenderer } from "./content-renderers/ForumRenderer";
import { AnnouncementRenderer } from "./content-renderers/AnnouncementRenderer";

export type { ContentItem };

export interface ContentViewerProps {
  content: ContentItem;
  userRole?: "STUDENT" | "TEACHER" | "ADMIN" | string;
  courseId?: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export default function ContentViewer({
  content,
  userRole = "STUDENT",
  courseId,
  isCompleted = false,
  onComplete,
}: ContentViewerProps) {
  const isStudent = userRole === "STUDENT";

  const renderBody = () => {
    switch (content.type) {
      case "TEXT":
        return (
          <TextRenderer
            content={content}
            courseId={courseId ? Number(courseId) : undefined}
            userRole={userRole}
          />
        );
      case "VIDEO":
        return <VideoRenderer content={content} />;
      case "IMAGE":
        return <ImageRenderer content={content} />;
      case "DOCUMENT":
        return <DocumentRenderer content={content} />;
      case "FORUM":
        return <ForumRenderer content={content} />;
      case "ANNOUNCEMENT":
        return <AnnouncementRenderer content={content} />;
      case "QUIZ":
        return (
          <QuizRenderer
            content={content}
            userRole={userRole}
            courseId={courseId}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
        );
      default:
        return <EmptyState message={`Loại nội dung "${content.type}" chưa được hỗ trợ.`} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Completion status */}
      {isStudent && content.is_mandatory && (
        <div className="flex items-center gap-2">
          <CompletionBadge isCompleted={isCompleted} />
          {!isCompleted && content.type !== "QUIZ" && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Xem xong nội dung này để tính vào tiến độ
            </span>
          )}
        </div>
      )}

      {/* Content body */}
      {renderBody()}

      {/* Dev debug panel */}
      {process.env.NODE_ENV === "development" && (
        <details className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <summary className="cursor-pointer font-mono text-slate-500">Debug</summary>
          <pre className="mt-2 overflow-auto text-slate-600 dark:text-slate-400">
            {JSON.stringify({ id: content.id, type: content.type, isCompleted, metadata: content.metadata }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}