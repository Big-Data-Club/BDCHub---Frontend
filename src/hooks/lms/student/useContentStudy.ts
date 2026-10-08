"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { flashcardLibraryService } from "@/services/lms/flashcardLibraryService";
import type { ConceptCheckQuestion } from "@/services/ai/aiService";
import type { MicroLessonContext } from "@/components/lms/student/micro/types";

export interface ContentStudyResult {
  saved_count?: number;
  deck_id?: number;
  questions?: ConceptCheckQuestion[];
  node_ids: number[];
}

export function useContentStudy(ctx: MicroLessonContext) {
  const [busy, setBusy] = useState<"cards" | "quiz" | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ContentStudyResult | null>(null);
  const controller = useRef<AbortController | null>(null);
  const requests = useRef<Partial<Record<"cards" | "quiz", string>>>({});
  const lock = useRef(false);
  const sourceKey = `${ctx.courseId}:${ctx.contentId ?? 0}:${ctx.lessonId ?? 0}`;
  useEffect(() => {
    requests.current = {}; setResult(null); setError(""); setBusy(null); lock.current = false;
    return () => controller.current?.abort();
  }, [sourceKey]);

  const generate = useCallback(async (kind: "cards" | "quiz") => {
    if (lock.current) return;
    lock.current = true;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(kind); setError("");
    const requestID = requests.current[kind] ?? crypto.randomUUID();
    requests.current[kind] = requestID;
    try {
      const response = await flashcardLibraryService(ctx.courseId).fromContent<ContentStudyResult>(kind === "cards" ? "generate_content" : "quiz_content", {
        ...(ctx.contentId ? { content_id: ctx.contentId } : { lesson_id: ctx.lessonId ?? undefined }),
        request_id: requestID, count: kind === "cards" ? 5 : 3, language: ctx.language ?? "vi",
      }, abort.signal);
      if (!abort.signal.aborted) { setResult(response); delete requests.current[kind]; }
    } catch (e) {
      if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Chưa tạo được. Hãy thử lại.");
    } finally {
      if (!abort.signal.aborted) { lock.current = false; setBusy(null); }
    }
  }, [ctx.courseId, ctx.contentId, ctx.lessonId, ctx.language]);
  return { busy, error, result, generate };
}
