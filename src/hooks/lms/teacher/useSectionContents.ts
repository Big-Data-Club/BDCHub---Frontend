"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import lmsService from "@/services/lms/lmsService";
import type { Content } from "@/types/lms/course";

/** Section data lives with the editor; loading is explicit and deduped per section. */
export function useSectionContents(courseId: number) {
  const [sectionContents, setSectionContents] = useState<
    Record<number, Content[]>
  >({});
  const [loadingContent, setLoadingContent] = useState<Record<number, boolean>>(
    {},
  );
  const [contentErrors, setContentErrors] = useState<Record<number, string>>(
    {},
  );
  const loaded = useRef(new Set<number>());
  const requests = useRef(
    new Map<number, { controller: AbortController; promise: Promise<void> }>(),
  );
  const generation = useRef({ value: 0 });

  useEffect(() => {
    loaded.current.clear();
    setSectionContents({});
    setLoadingContent({});
    setContentErrors({});
    const active = requests.current;
    const scope = generation.current;
    return () => {
      scope.value++;
      active.forEach((request) => request.controller.abort());
      active.clear();
    };
  }, [courseId]);

  const load = useCallback(
    (sectionId: number, force: boolean): Promise<void> => {
      const previous = requests.current.get(sectionId);
      if (!force && previous) return previous.promise;
      if (!force && loaded.current.has(sectionId)) return Promise.resolve();
      previous?.controller.abort();
      const controller = new AbortController();
      const owner = generation.current.value;
      setLoadingContent((prev) => ({ ...prev, [sectionId]: true }));
      setContentErrors((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      const promise = (async () => {
        try {
          const response = await lmsService.listContent(
            sectionId,
            controller.signal,
          );
          if (controller.signal.aborted || owner !== generation.current.value)
            return;
          loaded.current.add(sectionId);
          setSectionContents((prev) => ({
            ...prev,
            [sectionId]: response.data ?? [],
          }));
        } catch {
          if (
            !controller.signal.aborted &&
            owner === generation.current.value
          ) {
            setContentErrors((prev) => ({
              ...prev,
              [sectionId]: "Không tải được nội dung chương. Vui lòng thử lại.",
            }));
          }
        } finally {
          if (
            !controller.signal.aborted &&
            owner === generation.current.value
          ) {
            requests.current.delete(sectionId);
            setLoadingContent((prev) => ({ ...prev, [sectionId]: false }));
          }
        }
      })();
      requests.current.set(sectionId, { controller, promise });
      return promise;
    },
    [],
  );

  const loadContents = useCallback((id: number) => load(id, false), [load]);
  const reloadSectionContent = useCallback(
    (id: number) => load(id, true),
    [load],
  );
  return {
    sectionContents,
    setSectionContents,
    loadingContent,
    contentErrors,
    loadContents,
    reloadSectionContent,
  };
}
