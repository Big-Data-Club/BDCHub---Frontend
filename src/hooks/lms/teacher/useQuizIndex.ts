"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import quizService from "@/services/lms/quizService";
import type {
  QuizIndexState,
  QuizIndexMatch,
  QuizNodeLink,
} from "@/types/lms/quizIndex";

export function useQuizIndex(quizId: number) {
  const [index, setIndex] = useState<QuizIndexState | null>(null);
  const [offset, setOffset] = useState(0);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<QuizIndexMatch[] | null>(null);
  const mounted = useRef(false);
  const inFlight = useRef(false);
  const scope = useRef(quizId);
  scope.current = quizId;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setIndex(null);
    setMatches(null);
    setOffset(0);
  }, [quizId]);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const result = await quizService.getQuizIndex(
          quizId,
          offset,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setIndex(result);
        if (["pending", "processing"].includes(result.status))
          timer = setTimeout(load, 5000);
      } catch {
        if (!controller.signal.aborted)
          setError("Chưa tải được index. Hãy kiểm tra lại hoặc thử làm mới.");
      }
    }
    void load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [quizId, offset, version]);

  const run = useCallback(
    async function runAction<T>(
      work: () => Promise<T>,
    ): Promise<T | undefined> {
      if (inFlight.current) return;
      const id = quizId;
      inFlight.current = true;
      setBusy(true);
      setError("");
      try {
        const result = await work();
        return mounted.current && scope.current === id ? result : undefined;
      } catch {
        if (mounted.current && scope.current === id)
          setError(
            "Không thực hiện được. Nếu câu hỏi đã sửa, hãy index lại rồi thử lại.",
          );
      } finally {
        inFlight.current = false;
        if (mounted.current && scope.current === id) setBusy(false);
      }
    },
    [quizId],
  );

  const queue = () =>
    run(async () => {
      await quizService.queueQuizIndex(quizId, index?.status === "ready");
      if (mounted.current && scope.current === quizId) {
        setMatches(null);
        setVersion((v) => v + 1);
      }
    });
  const link = (body: QuizNodeLink) =>
    run(async () => {
      await quizService.linkQuizNode(quizId, body);
      try {
        await quizService.queueQuizIndex(quizId);
      } catch {
        if (mounted.current && scope.current === quizId)
          setError(
            "Đã gắn node. Chưa tạo lại được index; hãy bấm Index quiz để thử lại.",
          );
      }
      if (mounted.current && scope.current === quizId) {
        setMatches(null);
        setVersion((v) => v + 1);
      }
      return true;
    });
  const search = (query: string) =>
    run(async () => {
      const result = await quizService.searchQuizIndex(quizId, query);
      if (mounted.current && scope.current === quizId) setMatches(result.items);
    });
  const suggest = (questionId: number, hash: string) =>
    run(() => quizService.suggestQuizNode(quizId, questionId, hash));
  return {
    index,
    offset,
    setOffset,
    busy,
    error,
    matches,
    queue,
    link,
    search,
    suggest,
    reload: () => {
      setError("");
      setVersion((v) => v + 1);
    },
  };
}
