"use client";
import { useState, useEffect, useRef } from "react";
import { Copy, Sparkles, Plus } from "lucide-react";
import { workspaceService } from "../../api/workspaceService";
import type { WorkspacePage, EditorActions } from "../../types";
import type { useWorkspacePanel } from "../../hooks/useWorkspacePanel";
import {
  WorkspaceButton,
  WorkspaceErrorBanner,
  workspaceInputClass,
} from "../WorkspacePrimitives";

export function AiPanel({
  model,
  page,
  editor,
  selection,
}: {
  model: ReturnType<typeof useWorkspacePanel>;
  page: WorkspacePage;
  editor: EditorActions | null;
  selection: string;
}) {
  const access = page.access || 0;
  const [prompt, setPrompt] = useState(""),
    [answer, setAnswer] = useState(""),
    [aiBusy, setAiBusy] = useState(false),
    [aiError, setAiError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), [page.id]);
  async function ask() {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setAiBusy(true);
    setAiError(null);
    setAnswer("");
    try {
      const result = await workspaceService.askAi(
        page.id,
        prompt,
        selection,
        setAnswer,
        next.signal,
      );
      if (!result) setAiError("AI chưa trả về nội dung. Vui lòng thử lại.");
    } catch (reason) {
      if (!next.signal.aborted)
        setAiError(
          reason instanceof Error ? reason.message : "Chưa kết nối được AI.",
        );
    } finally {
      setAiBusy(false);
    }
  }
  return (
    <>
      <p className="text-xs leading-6 text-slate-500">
        AI nhận đoạn bạn chọn hoặc nội dung trang hiện tại. Bạn xem trước và
        quyết định chèn kết quả.
      </p>
      {selection && (
        <p className="line-clamp-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs dark:bg-lms-card">
          {selection}
        </p>
      )}
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void ask();
        }}
      >
        <textarea
          aria-label="Yêu cầu AI"
          required
          maxLength={2000}
          placeholder="Giải thích, tóm tắt hoặc đề xuất câu hỏi…"
          className={`${workspaceInputClass} min-h-24 w-full`}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <div className="flex gap-2">
          <WorkspaceButton type="submit" disabled={aiBusy || !prompt.trim()}>
            <Sparkles className="size-4" />
            {aiBusy ? "Đang trả lời…" : "Hỏi AI"}
          </WorkspaceButton>
          {aiBusy && (
            <WorkspaceButton onClick={() => controller.current?.abort()}>
              Dừng
            </WorkspaceButton>
          )}
        </div>
      </form>
      <WorkspaceErrorBanner message={aiError} />
      {answer && (
        <>
          <div className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 leading-7 dark:bg-lms-card">
            {answer}
          </div>
          <WorkspaceButton
            disabled={!editor || access < 3 || aiBusy}
            onClick={() =>
              void model.run(async () => {
                await editor?.insertMarkdown(answer);
              })
            }
          >
            <Plus className="size-4" />
            Chèn kết quả vào trang
          </WorkspaceButton>
          <WorkspaceButton
            onClick={() =>
              void model.run(() => navigator.clipboard.writeText(answer))
            }
          >
            <Copy className="size-4" />
            Sao chép
          </WorkspaceButton>
        </>
      )}
    </>
  );
}
