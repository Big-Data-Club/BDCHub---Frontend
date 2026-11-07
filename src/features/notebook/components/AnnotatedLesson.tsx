"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookmarkPlus } from "lucide-react";
import type {
  HighlightColor,
  NotebookAnnotation,
  NotebookEntry,
} from "@/types/ai/notebook";
import { useCourseNotebook } from "../CourseNotebookContext";
import { lessonText, textOffset, textRange, resolveAnchor } from "../anchors";
import { registerHighlights } from "../highlight-registry";
import { highlightColors } from "../colors";
import { ColorPicker } from "./ColorPicker";

type SelectionInfo = {
  annotation: NotebookAnnotation;
  left: number;
  top: number;
};
export function AnnotatedLesson({
  contentId,
  title,
  children,
}: {
  contentId: number;
  title: string;
  children: React.ReactNode;
}) {
  const notebook = useCourseNotebook();
  const notes = notebook?.notes;
  const enabled = !!notebook;
  const root = useRef<HTMLDivElement>(null);
  const owner = useId();
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [color, setColor] = useState<HighlightColor>("yellow");
  const [rects, setRects] = useState<
    {
      left: number;
      top: number;
      width: number;
      height: number;
      color: HighlightColor;
    }[]
  >([]);
  const ranges = useRef<{ entry: NotebookEntry; range: Range }[]>([]);
  useEffect(() => {
    const element = root.current;
    if (!element || !enabled) return;
    let frame = 0;
    function render() {
      if (!element) return;
      const snapshot = lessonText(element);
      const entries = (notes || []).filter(
        (entry) => entry.annotation?.content_id === contentId,
      );
      ranges.current = entries.flatMap((entry) => {
        const position = resolveAnchor(snapshot.text, entry.annotation!);
        const range = position ? textRange(snapshot.nodes, ...position) : null;
        return range ? [{ entry, range }] : [];
      });
      const supported = registerHighlights(
        owner,
        ranges.current.map((item) => ({
          color: item.entry.annotation!.color,
          range: item.range,
        })),
      );
      if (!supported) {
        const box = element.getBoundingClientRect();
        setRects(
          ranges.current.flatMap((item) =>
            [...item.range.getClientRects()].map((rect) => ({
              left: rect.left - box.left,
              top: rect.top - box.top,
              width: rect.width,
              height: rect.height,
              color: item.entry.annotation!.color,
            })),
          ),
        );
      }
    }
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    const observer = new MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            !(
              record.target instanceof Element
                ? record.target
                : record.target.parentElement
            )?.closest("[data-annotation-layer]"),
        )
      )
        schedule();
    });
    observer.observe(element, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    render();
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", schedule);
      registerHighlights(owner, null);
      ranges.current = [];
    };
  }, [notes, contentId, owner, enabled]);
  useEffect(() => {
    const element = root.current;
    if (!element || !enabled) return;
    function read() {
      const selected = window.getSelection();
      if (!selected?.rangeCount || selected.isCollapsed) {
        setSelection(null);
        return;
      }
      const range = selected.getRangeAt(0);
      if (
        !element!.contains(range.startContainer) ||
        !element!.contains(range.endContainer)
      ) {
        setSelection(null);
        return;
      }
      const snapshot = lessonText(element!);
      let start = textOffset(
        snapshot.nodes,
        range.startContainer,
        range.startOffset,
      );
      const end = textOffset(
        snapshot.nodes,
        range.endContainer,
        range.endOffset,
      );
      const raw = snapshot.text.slice(start, end);
      const quote = raw.trim();
      if (!quote || quote.length > 15000) {
        setSelection(null);
        return;
      }
      start += raw.indexOf(quote);
      const finish = start + quote.length;
      const box = range.getBoundingClientRect();
      setSelection({
        annotation: {
          version: 1,
          content_id: contentId,
          quote,
          start,
          end: finish,
          prefix: snapshot.text.slice(Math.max(0, start - 64), start),
          suffix: snapshot.text.slice(finish, finish + 64),
          color,
        },
        left: Math.max(8, Math.min(box.left, window.innerWidth - 300)),
        top: Math.max(8, Math.min(box.bottom + 8, window.innerHeight - 64)),
      });
    }
    const hide = () => setSelection(null);
    document.addEventListener("selectionchange", read);
    document.addEventListener("pointerup", read);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("selectionchange", read);
      document.removeEventListener("pointerup", read);
      window.removeEventListener("scroll", hide, true);
    };
  }, [enabled, contentId, color]);
  return (
    <div
      ref={root}
      data-annotated-lesson={contentId}
      className="relative"
      onPointerUp={(event) => {
        if (!window.getSelection()?.isCollapsed) return;
        const match = ranges.current.find((item) =>
          [...item.range.getClientRects()].some(
            (rect) =>
              event.clientX >= rect.left &&
              event.clientX <= rect.right &&
              event.clientY >= rect.top &&
              event.clientY <= rect.bottom,
          ),
        );
        if (match) notebook?.revealNote(match.entry);
      }}
    >
      {children}
      {!!rects.length && (
        <div
          data-annotation-layer
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {rects.map((rect, i) => (
            <span
              key={i}
              className="absolute rounded-sm"
              style={{
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                backgroundColor: highlightColors.find(
                  (item) => item.value === rect.color,
                )?.background,
              }}
            />
          ))}
        </div>
      )}
      {selection &&
        notebook &&
        createPortal(
          <div
            role="toolbar"
            aria-label="Ghi chú đoạn được chọn"
            style={{ left: selection.left, top: selection.top }}
            className="fixed z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-cyan-500/25 dark:bg-lms-card"
            onPointerDown={(event) => event.preventDefault()}
          >
            <ColorPicker value={color} onChange={setColor} />
            <span className="h-6 w-px bg-slate-200 dark:bg-blue-500/20" />
            <button
              type="button"
              onClick={() => {
                notebook.fromSelection(
                  { ...selection.annotation, color },
                  title,
                );
                window.getSelection()?.removeAllRanges();
                setSelection(null);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white"
            >
              <BookmarkPlus size={14} />
              Ghi chú
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
