"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { workspaceService } from "../../api/workspaceService";
import type { WorkspacePage } from "../../types";
import type { useWorkspacePanel } from "../../hooks/useWorkspacePanel";
import { WorkspaceButton, workspaceInputClass } from "../WorkspacePrimitives";
import { WorkspaceTaskLinks } from "../WorkspaceTaskLinks";

export function SourcesPanel({
  model,
  page,
  onRefresh,
  onOpen,
}: {
  model: ReturnType<typeof useWorkspacePanel>;
  page: WorkspacePage;
  onRefresh: () => void;
  onOpen: (id: string) => void;
}) {
  const access = page.access || 0;
  const [label, setLabel] = useState(""),
    [url, setUrl] = useState(""),
    [sourceType, setSourceType] = useState<
      "url" | "course" | "lab" | "task" | "studio"
    >("url");
  return (
    <>
      <WorkspaceTaskLinks page={page} onRefresh={onRefresh} />
      <p className="text-xs leading-6 text-slate-500">
        Gắn bài học, lab, task hoặc tài liệu. Mỗi nguồn vẫn áp dụng quyền truy
        cập của chức năng gốc.
      </p>
      {model.references?.sources.map((source, index) => (
        <div
          key={`${source.url}:${index}`}
          className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-lms-border"
        >
          <a
            className="min-w-0 flex-1 break-words text-blue-600 dark:text-cyan-400"
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.label}
          </a>
          {access >= 3 && (
            <WorkspaceButton
              aria-label="Bỏ nguồn"
              onClick={() =>
                void model.run(async () => {
                  await workspaceService.updatePage(page.id, {
                    version: page.version,
                    sources: page.sources.filter((_, i) => i !== index),
                  });
                  onRefresh();
                })
              }
            >
              <X className="size-3" />
            </WorkspaceButton>
          )}
        </div>
      ))}
      {access >= 3 && (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void model.run(async () => {
              const parsed = new URL(url, location.origin);
              if (!["http:", "https:"].includes(parsed.protocol))
                throw Error("Dùng liên kết http hoặc https.");
              await workspaceService.updatePage(page.id, {
                version: page.version,
                sources: [
                  ...page.sources,
                  {
                    type: sourceType,
                    label,
                    url:
                      parsed.origin === location.origin
                        ? parsed.pathname + parsed.search
                        : parsed.href,
                  },
                ],
              });
              setLabel("");
              setUrl("");
              onRefresh();
            });
          }}
        >
          <input
            required
            maxLength={200}
            aria-label="Tên nguồn"
            placeholder="Tên nguồn"
            className={`${workspaceInputClass} w-full`}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <input
            required
            aria-label="Liên kết nguồn"
            placeholder="https://… hoặc /lms/…"
            className={`${workspaceInputClass} w-full`}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <select
            aria-label="Loại nguồn"
            className={workspaceInputClass}
            value={sourceType}
            onChange={(event) =>
              setSourceType(event.target.value as typeof sourceType)
            }
          >
            {[
              ["url", "Tài liệu"],
              ["course", "Bài học"],
              ["lab", "Virtual Lab"],
              ["task", "Task"],
              ["studio", "AI Studio"],
            ].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <WorkspaceButton type="submit" disabled={model.busy}>
            <Plus className="size-4" />
            Gắn nguồn
          </WorkspaceButton>
        </form>
      )}
      <h3 className="font-semibold">Trang liên kết đến đây</h3>
      {model.references?.backlinks.map((item) => (
        <WorkspaceButton
          key={item.id}
          className="w-full justify-start"
          onClick={() => onOpen(item.id)}
        >
          {item.title}
        </WorkspaceButton>
      ))}
    </>
  );
}
