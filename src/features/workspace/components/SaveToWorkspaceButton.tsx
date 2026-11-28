"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { PanelsTopLeft, Loader2 } from "lucide-react";
import { workspaceService } from "../api/workspaceService";
import type { WorkspaceSource } from "../types";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "./WorkspacePrimitives";
export function SaveToWorkspaceButton({
  title,
  markdown,
  sources = [],
  sourceCount = sources.length,
  resolveSources,
}: {
  title: string;
  markdown: string;
  sources?: WorkspaceSource[];
  sourceCount?: number;
  resolveSources?: () => Promise<WorkspaceSource[]>;
}) {
  const [id, setId] = useState(""),
    [draft, setDraft] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const saving = useRef(false);
  const save = async () => {
    const name = draft?.trim();
    if (saving.current || !name) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const page = await workspaceService.capture(
        name,
        markdown,
        resolveSources ? await resolveSources() : sources,
      );
      setId(page.id);
      setDraft(null);
      window.dispatchEvent(new Event("bdc:library-refresh"));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa lưu được ghi chú.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  if (id)
    return (
      <Link
        href={`/workspace?page=${id}`}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-blue-600 dark:text-cyan-400"
      >
        <PanelsTopLeft className="size-3.5" />
        Mở trong Workspace
      </Link>
    );
  return (
    <>
      <button
        type="button"
        disabled={!markdown.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-500 transition-all hover:bg-blue-50 active:scale-95 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-500/10"
        onClick={() => {
          setError("");
          setDraft(title);
        }}
      >
        <PanelsTopLeft className="size-3.5" />
        Lưu vào Workspace
      </button>
      <WorkspaceDialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !saving.current) setDraft(null);
        }}
        title="Lưu vào Workspace"
        description="Ghi chú sẽ nằm trong mục Chưa xếp lĩnh vực của Không gian cá nhân."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <label className="grid gap-2 text-sm">
            Tên trang
            <input
              autoFocus
              required
              maxLength={300}
              disabled={busy}
              className={workspaceInputClass}
              value={draft ?? ""}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          {sourceCount > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kèm {sourceCount} nguồn đã trích dẫn.
            </p>
          )}
          <WorkspaceErrorBanner message={error} />
          <div className="flex justify-end gap-2">
            <WorkspaceButton disabled={busy} onClick={() => setDraft(null)}>
              Hủy
            </WorkspaceButton>
            <WorkspaceButton
              type="submit"
              disabled={busy || !draft?.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
            >
              {busy && <Loader2 className="size-3.5 animate-spin" />}
              {busy ? "Đang lưu…" : "Lưu ghi chú"}
            </WorkspaceButton>
          </div>
        </form>
      </WorkspaceDialog>
    </>
  );
}
