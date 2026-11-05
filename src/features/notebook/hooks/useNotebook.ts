"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  agentService,
  notifyNotebookChanged,
} from "@/services/ai/agentService";
import type { NotebookEntry, NotebookAnnotation } from "@/types/ai/notebook";

export function useNotebook(courseId?: number, creationCourseId = courseId) {
  const [notes, setNotes] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  const lock = useRef(false);
  const reload = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const entries = await agentService.listNotebook(courseId);
      if (request === generation.current) setNotes(entries);
    } catch {
      if (request === generation.current)
        setError("Không tải được ghi chú. Bạn có thể thử lại.");
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [courseId]);
  useEffect(() => {
    setNotes([]);
    void reload();
    const refresh = () => {
      void reload();
    };
    window.addEventListener("bdc:notebook-changed", refresh);
    return () => {
      invalidate();
      window.removeEventListener("bdc:notebook-changed", refresh);
    };
  }, [reload, invalidate]);
  async function save(
    title: string,
    content: string,
    id?: string,
    annotation?: NotebookAnnotation | null,
  ) {
    if (lock.current) return null;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const entry = id
        ? await agentService.updateNotebookEntry(id, {
            title,
            content,
            annotation,
          })
        : await agentService.saveNotebookEntry({
            title,
            content,
            courseId: creationCourseId,
            annotation,
          });
      invalidate();
      setNotes((current) => [
        entry,
        ...current.filter((note) => note.id !== entry.id),
      ]);
      notifyNotebookChanged();
      return entry;
    } catch {
      setError(
        "Chưa lưu được ghi chú. Nội dung đang soạn vẫn được giữ lại; hãy thử lại.",
      );
      return null;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await agentService.deleteNotebookEntry(id);
      invalidate();
      setNotes((current) => current.filter((note) => note.id !== id));
      notifyNotebookChanged();
      return true;
    } catch {
      setError("Không xóa được ghi chú. Hãy thử lại.");
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { notes, loading, busy, error, reload, save, remove };
}
