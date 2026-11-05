"use client";

import { useEffect, useState } from "react";
import type {
  NotebookDraft,
  NotebookEntry,
  NotebookAnnotation,
} from "@/types/ai/notebook";
import { useNotebook } from "../hooks/useNotebook";
import { NoteEditor } from "./NoteEditor";
import { NoteReader } from "./NoteReader";
import { NotebookList } from "./NotebookList";
import { NotebookHeader } from "./NotebookHeader";

type Editor = NotebookDraft & { id?: string };
type Props = {
  courseId?: number;
  className?: string;
  draft?: NotebookDraft | null;
  clearDraft?: () => void;
  onDraftChange?: (draft: NotebookDraft | null) => void;
  revealEntry?: NotebookEntry | null;
};
export function NotebookBrowser({
  courseId,
  className = "",
  draft,
  clearDraft,
  onDraftChange,
  revealEntry,
}: Props) {
  const [scope, setScope] = useState<"course" | "all">("course");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<NotebookEntry | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const notebook = useNotebook(
    scope === "course" ? courseId : undefined,
    courseId,
  );
  useEffect(() => {
    if (draft) {
      setEditor(draft);
      setSelected(null);
    }
  }, [draft]);
  useEffect(() => {
    if (revealEntry) {
      setSelected(revealEntry);
      setEditor(null);
    }
  }, [revealEntry]);
  const filtered = notebook.notes.filter((note) =>
    `${note.title} ${note.content} ${note.annotation?.quote || ""}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const current = selected
    ? notebook.notes.find((note) => note.id === selected.id) || selected
    : null;
  function beginEditor(value: Editor) {
    setEditor(value);
    onDraftChange?.(value);
  }
  async function save(
    title: string,
    content: string,
    annotation?: NotebookAnnotation | null,
  ) {
    const entry = await notebook.save(title, content, editor?.id, annotation);
    if (entry) {
      setSelected(entry);
      setEditor(null);
      clearDraft?.();
    }
  }
  async function changeAnnotation(annotation: NotebookAnnotation | null) {
    if (!current) return;
    const entry = await notebook.save(
      current.title,
      current.content,
      current.id,
      annotation,
    );
    if (entry) setSelected(entry);
  }
  async function remove() {
    if (
      current &&
      confirm("Xóa ghi chú và highlight tương ứng?") &&
      (await notebook.remove(current.id))
    ) {
      setSelected(null);
      clearDraft?.();
    }
  }
  return (
    <div
      className={`flex h-full min-h-0 flex-col bg-white text-slate-900 dark:bg-lms-bg dark:text-slate-100 ${className}`}
    >
      <NotebookHeader
        courseId={courseId}
        count={notebook.notes.length}
        busy={notebook.busy}
        editing={!!editor}
        scope={scope}
        onScope={(value) => {
          setScope(value);
          setSelected(null);
        }}
        query={query}
        onQuery={setQuery}
        searching={!editor && !current}
        onCreate={() => {
          setSelected(null);
          beginEditor({ key: crypto.randomUUID(), title: "", content: "" });
        }}
      />
      {notebook.error && (
        <div
          role="alert"
          className="m-3 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {notebook.error}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => void notebook.reload()}
          >
            Tải lại
          </button>
        </div>
      )}
      {editor ? (
        <NoteEditor
          key={editor.key}
          title={editor.title}
          content={editor.content}
          annotation={editor.annotation}
          editing={!!editor.id}
          busy={notebook.busy}
          onSave={save}
          onChange={(title, content, annotation) => {
            if (editor)
              onDraftChange?.({ ...editor, title, content, annotation });
          }}
          onCancel={() => {
            setEditor(null);
            clearDraft?.();
          }}
        />
      ) : current ? (
        <NoteReader
          note={current}
          busy={notebook.busy}
          onBack={() => {
            setSelected(null);
            clearDraft?.();
          }}
          onEdit={() =>
            beginEditor({
              key: current.id,
              id: current.id,
              title: current.title,
              content:
                current.annotation &&
                current.content === current.annotation.quote
                  ? ""
                  : current.content,
              annotation: current.annotation,
            })
          }
          onRemove={() => void remove()}
          onAnnotation={(value) => void changeAnnotation(value)}
        />
      ) : (
        <NotebookList
          notes={filtered}
          loading={notebook.loading}
          query={query}
          onSelect={setSelected}
        />
      )}
    </div>
  );
}
