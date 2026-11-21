"use client";
import Link from "next/link";
import { useState } from "react";
import { PanelsTopLeft, Loader2 } from "lucide-react";
import { workspaceService } from "../api/workspaceService";
import type { WorkspaceSource } from "../types";
export function SaveToWorkspaceButton({
  title,
  markdown,
  sources = [],
}: {
  title: string;
  markdown: string;
  sources?: WorkspaceSource[];
}) {
  const [id, setId] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
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
    <span>
      <button
        type="button"
        disabled={busy || !markdown}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-500 transition-all hover:bg-blue-50 active:scale-95 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-blue-500/10"
        onClick={() => {
          setBusy(true);
          setError("");
          void workspaceService
            .capture(title, markdown, sources)
            .then((page) => setId(page.id))
            .catch((reason) => setError(reason.message))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <PanelsTopLeft className="size-3.5" />
        )}
        Lưu vào Workspace
      </button>
      {error && (
        <span
          role="alert"
          className="block text-xs text-rose-600 dark:text-rose-300"
        >
          {error}
        </span>
      )}
    </span>
  );
}
