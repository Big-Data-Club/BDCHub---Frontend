"use client";

import { useEffect, useRef, useMemo } from "react";
import useSWR from "swr";
import { ContentItem, CompletionBadge, EmptyState } from "./content-renderers/utils";
import { TextRenderer } from "./content-renderers/TextRenderer";
import { VideoRenderer } from "./content-renderers/VideoRenderer";
import { ImageRenderer } from "./content-renderers/ImageRenderer";
import { DocumentRenderer } from "./content-renderers/DocumentRenderer";
import { QuizRenderer } from "./content-renderers/QuizRenderer";
import { ForumRenderer } from "./content-renderers/ForumRenderer";
import { AnnouncementRenderer } from "./content-renderers/AnnouncementRenderer";
import analyticsService from "@/services/analyticsService";
import aiService from "@/services/aiService";

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
  const hasTrackedView = useRef<string | null>(null);

  const shouldFetchNodes = isStudent && !!courseId && content.type !== "TEXT";

  // Use SWR to cache the knowledge nodes for the entire course
  const { data: nodes, error: nodesError } = useSWR(
    shouldFetchNodes ? `/lmsapiv1/courses/${courseId}/ai/nodes` : null,
    () => aiService.listKnowledgeNodes(Number(courseId))
  );

  const nodeId = useMemo(() => {
    if (!shouldFetchNodes) return null;
    
    const metaNodeId = content.metadata?.node_id;
    if (metaNodeId) {
      return Number(metaNodeId);
    }

    if (!nodes) return null;

    let match = nodes.find((n) => n.source_content_id === content.id);
    if (!match) {
      const titleLower = content.title.trim().toLowerCase();
      match = nodes.find((n) => n.name.trim().toLowerCase() === titleLower);
    }
    return match ? match.id : null;
  }, [shouldFetchNodes, content.metadata, content.id, content.title, nodes]);

  const loadingNode = shouldFetchNodes && !nodes && !nodesError;

  // 2. Track view and auto-complete (15s threshold)
  useEffect(() => {
    if (!courseId || !isStudent || content.type === "TEXT" || loadingNode) return;

    const currentKey = `${content.id}:${nodeId}`;
    if (hasTrackedView.current === currentKey) return;
    hasTrackedView.current = currentKey;

    // Track lesson view
    analyticsService.trackMicroInteraction({
      course_id: Number(courseId),
      lesson_id: null,
      node_id: nodeId,
      action_type: "lesson_view",
    });

    // Set auto-completion timer (15 seconds of engagement)
    const timer = setTimeout(() => {
      analyticsService.trackMicroInteraction({
        course_id: Number(courseId),
        lesson_id: null,
        node_id: nodeId,
        action_type: "lesson_complete",
        payload: { reason: "viewed_15s" },
      });
    }, 15000);

    return () => {
      clearTimeout(timer);
    };
  }, [content.id, content.type, nodeId, courseId, isStudent, loadingNode]);

  // 3. Track explicit completion when isCompleted changes from false to true
  const prevCompleted = useRef(isCompleted);
  useEffect(() => {
    if (!courseId || !isStudent || content.type === "TEXT" || loadingNode) return;

    if (isCompleted && !prevCompleted.current) {
      analyticsService.trackMicroInteraction({
        course_id: Number(courseId),
        lesson_id: null,
        node_id: nodeId,
        action_type: "lesson_complete",
        payload: { reason: "explicit_completion" },
      });
    }
    prevCompleted.current = isCompleted;
  }, [isCompleted, content.type, courseId, isStudent, nodeId, loadingNode]);

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