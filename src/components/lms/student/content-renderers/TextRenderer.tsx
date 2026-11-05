"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { ContentItem } from "./utils";
import { useSetPageContext } from "@/hooks/common/usePageContext";
import { AnnotatedLesson } from "@/features/notebook/components/AnnotatedLesson";

const MarkdownRenderer = dynamic(
  () => import("@/components/markdown/MarkdownRenderer"),
  { ssr: false, loading: () => <div className="h-32 bg-slate-100 dark:bg-[#0D192E] rounded-xl animate-pulse" /> },
);

interface TextRendererProps {
  content: ContentItem;
  courseId?: number;
  userRole?: string;
}

export function TextRenderer({
  content,
  userRole,
}: TextRendererProps) {
  const { patchPageContext } = useSetPageContext();

  const markdownBody = content.metadata?.content || "";

  // Sync lesson text to global PageContext for the Chat Sidebar
  useEffect(() => {
    if (markdownBody) {
      patchPageContext({ contentBody: markdownBody });
    }
  }, [markdownBody, patchPageContext]);

  const body = <MarkdownRenderer content={markdownBody} />;
  return userRole === "STUDENT" ? <AnnotatedLesson key={content.id} contentId={content.id} title={content.title}>{body}</AnnotatedLesson> : body;
}
