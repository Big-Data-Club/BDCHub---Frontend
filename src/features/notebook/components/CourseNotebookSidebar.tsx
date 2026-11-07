"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { BookOpenText, PanelRightClose, PanelRightOpen, X } from "lucide-react";
import { useCourseNotebook } from "../CourseNotebookContext";
import { NotebookBrowser } from "./NotebookBrowser";

export function CourseNotebookSidebar() {
  const notebook = useCourseNotebook();
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const media = matchMedia("(min-width: 1280px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (!notebook || desktop === null) return null;
  const body = (
    <NotebookBrowser
      key={notebook.courseId}
      courseId={notebook.courseId}
      draft={notebook.draft}
      revealEntry={notebook.activeNote}
      onDraftChange={notebook.setDraft}
      clearDraft={notebook.clearDraft}
    />
  );
  if (!desktop)
    return (
      <Dialog.Root open={notebook.open} onOpenChange={notebook.setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-slate-950/60 data-[state=closed]:hidden" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl data-[state=closed]:hidden dark:border-blue-500/20 dark:bg-lms-bg">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-blue-500/10">
              <Dialog.Title className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <BookOpenText size={16} />
                Ghi chú khóa học
              </Dialog.Title>
              <Dialog.Close
                aria-label="Đóng thanh ghi chú"
                className="rounded-xl p-2 text-slate-500 dark:text-slate-400"
              >
                <X size={16} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">
              Ghi chú riêng tư và các đoạn đánh dấu của bạn trong khóa học
            </Dialog.Description>
            <div className="min-h-0 flex-1">{body}</div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  return (
    <>
      {!notebook.open && (
        <button
          type="button"
          onClick={() => notebook.setOpen(true)}
          aria-label="Mở thanh ghi chú"
          title="Mở thanh ghi chú"
          className="sticky top-20 z-30 ml-auto flex h-12 w-9 shrink-0 items-center justify-center rounded-l-xl border border-r-0 border-slate-200 bg-white text-blue-600 shadow-sm dark:border-blue-500/20 dark:bg-lms-card dark:text-cyan-400"
        >
          <PanelRightOpen size={17} />
        </button>
      )}
      <aside
        aria-label="Ghi chú khóa học"
        aria-hidden={!notebook.open}
        inert={!notebook.open}
        className={`sticky top-16 flex h-[calc(100dvh-64px)] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white transition-[width,opacity] duration-200 dark:border-blue-500/15 dark:bg-lms-bg ${notebook.open ? "w-80 opacity-100 2xl:w-96" : "w-0 border-l-0 opacity-0"}`}
      >
        <div className="flex h-full w-80 flex-col 2xl:w-96">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-blue-500/10 dark:bg-lms-card">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-cyan-400" />
              Sổ tay học tập
            </span>
            <button
              type="button"
              aria-label="Thu gọn thanh ghi chú"
              onClick={() => notebook.setOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-blue-500/10"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
          <div className="min-h-0 flex-1">{body}</div>
        </div>
      </aside>
    </>
  );
}
