"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ContentItem } from "./utils";
import aiService from "@/services/aiService";
import { useSetPageContext } from "@/hooks/usePageContext";

const MarkdownRenderer = dynamic(
  () => import("@/components/markdown/MarkdownRenderer"),
  { ssr: false, loading: () => <div className="h-32 bg-slate-100 dark:bg-[#0D192E] rounded-xl animate-pulse" /> },
);

const QuickActionPanel = dynamic(
  () => import("@/components/lms/student/micro/QuickActionPanel").then(m => ({ default: m.QuickActionPanel })),
  { ssr: false },
);

interface TextRendererProps {
  content: ContentItem;
  courseId?: number;
  userRole?: string;
}

export function TextRenderer({
  content,
  courseId,
  userRole,
}: TextRendererProps) {
  const { patchPageContext } = useSetPageContext();

  const markdownBody = content.metadata?.content || "";
  const showPanel = userRole === "STUDENT" && !!courseId && !!markdownBody;

  // Sync lesson text to global PageContext for the Chat Sidebar
  useEffect(() => {
    if (markdownBody) {
      patchPageContext({ contentBody: markdownBody });
    }
  }, [markdownBody, patchPageContext]);

  const [nodeId, setNodeId] = useState<number | null>(null);
  const [loadingNode, setLoadingNode] = useState(userRole === "STUDENT" && !!courseId);

  // Auto-lookup knowledge nodeId linked to this content.
  // Strategy: 1) source_content_id exact match, 2) metadata.node_id,
  // 3) title match (micro-lesson TEXT has same title as its node).
  useEffect(() => {
    if (!courseId || userRole !== "STUDENT") {
      setLoadingNode(false);
      return;
    }

    // If content metadata already has node_id (set by micro-lesson generator)
    const metaNodeId = content.metadata?.node_id;
    if (metaNodeId) {
      setNodeId(Number(metaNodeId));
      setLoadingNode(false);
      return;
    }

    let cancelled = false;
    setLoadingNode(true);
    aiService
      .listKnowledgeNodes(courseId)
      .then((nodes) => {
        if (cancelled) return;
        // 1) Exact source_content_id match
        let match = nodes.find((n) => n.source_content_id === content.id);
        // 2) Fallback: match by title (micro-lesson TEXT shares name with its node)
        if (!match) {
          const titleLower = content.title.trim().toLowerCase();
          match = nodes.find((n) => n.name.trim().toLowerCase() === titleLower);
        }
        if (match) setNodeId(match.id);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingNode(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, content.id, content.title, content.metadata, userRole]);

  return (
    <>
      <MarkdownRenderer content={markdownBody} />
      {showPanel && !loadingNode && (
        <QuickActionPanel
          ctx={{
            lessonId: null,
            lessonTitle: content.title,
            lessonText: markdownBody,
            courseId: courseId!,
            nodeId,
            contentId: content.id,
          }}
        />
      )}
    </>
  );
}
