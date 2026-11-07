"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  NotebookDraft,
  NotebookEntry,
  NotebookAnnotation,
} from "@/types/ai/notebook";
import { useNotebook } from "./hooks/useNotebook";

type Context = {
  courseId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  draft: NotebookDraft | null;
  setDraft: (draft: NotebookDraft | null) => void;
  clearDraft: () => void;
  notes: NotebookEntry[];
  activeNote: NotebookEntry | null;
  fromSelection: (annotation: NotebookAnnotation, title: string) => void;
  revealNote: (entry: NotebookEntry) => void;
};
const CourseNotebookContext = createContext<Context | null>(null);
const preference = "bdc-course-notebook-open";

export function CourseNotebookProvider({
  courseId,
  children,
}: {
  courseId: number;
  children: React.ReactNode;
}) {
  const { notes } = useNotebook(courseId);
  const [open, setVisible] = useState(false);
  const [draft, setDraftValue] = useState<NotebookDraft | null>(null);
  const [activeNote, setActiveNote] = useState<NotebookEntry | null>(null);
  const setDraft = useCallback((value: NotebookDraft | null) => {
    setDraftValue(value);
    setActiveNote(null);
  }, []);
  const setOpen = useCallback((value: boolean) => {
    setVisible(value);
    try {
      localStorage.setItem(preference, String(value));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      setVisible(
        matchMedia("(min-width: 1280px)").matches &&
          localStorage.getItem(preference) !== "false",
      );
    } catch {}
    const reveal = () => setOpen(true);
    window.addEventListener("bdc:open-course-notebook", reveal);
    return () => window.removeEventListener("bdc:open-course-notebook", reveal);
  }, [setOpen]);
  const clearDraft = useCallback(() => setDraft(null), [setDraft]);
  const fromSelection = useCallback(
    (annotation: NotebookAnnotation, title: string) => {
      if (draft && !confirm("Thay ghi chú đang soạn bằng đoạn đánh dấu mới?"))
        return;
      setDraft({
        key: crypto.randomUUID(),
        title: `Ghi chú: ${title}`.slice(0, 180),
        content: "",
        annotation,
      });
      setOpen(true);
    },
    [setOpen, draft, setDraft],
  );
  const revealNote = useCallback(
    (entry: NotebookEntry) => {
      if (draft && !confirm("Đóng ghi chú đang soạn để mở highlight này?"))
        return;
      setDraft(null);
      setActiveNote({ ...entry });
      setOpen(true);
    },
    [setOpen, draft, setDraft],
  );
  const value = useMemo(
    () => ({
      courseId,
      open,
      setOpen,
      draft,
      setDraft,
      clearDraft,
      fromSelection,
      revealNote,
      notes,
      activeNote,
    }),
    [
      courseId,
      open,
      setOpen,
      draft,
      clearDraft,
      fromSelection,
      revealNote,
      notes,
      activeNote,
      setDraft,
    ],
  );
  return (
    <CourseNotebookContext.Provider value={value}>
      {children}
    </CourseNotebookContext.Provider>
  );
}

export function useCourseNotebook() {
  return useContext(CourseNotebookContext);
}
