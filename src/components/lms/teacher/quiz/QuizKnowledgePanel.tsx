"use client";

import { useState } from "react";
import { QuizNodeStatisticsTable } from "./QuizNodeStatistics";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useQuizIndex } from "@/hooks/lms/teacher/useQuizIndex";
import type { QuizIndexItem, QuizNodeStatistics } from "@/types/lms/quizIndex";

const button =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700";
const field =
  "w-full min-w-0 rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-[#0D192E]";
const labels = {
  not_indexed: "Chưa index",
  pending: "Đang chờ",
  processing: "Đang index",
  ready: "Sẵn sàng",
  failed: "Index thất bại",
  stale: "Nội dung đã thay đổi, cần index lại",
  interrupted: "Xử lý bị gián đoạn, có thể thử lại",
};

export function QuizKnowledgePanel({
  quizId,
  nodes,
  onLinked,
}: {
  quizId: number;
  nodes: QuizNodeStatistics[];
  onLinked: () => void;
}) {
  const state = useQuizIndex(quizId);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<{
    item: QuizIndexItem;
    name: string;
    description: string;
  } | null>(null);
  const active =
    state.index && ["pending", "processing"].includes(state.index.status);
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-blue-500/10 dark:bg-[#0F1E35]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Quiz & bản đồ kiến thức</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Mỗi câu là một chunk riêng. Liên kết node được giảng viên duyệt.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={button}
            disabled={state.busy || !!active}
            onClick={() => void state.queue()}
          >
            Index quiz
          </button>
          <button
            className={button}
            disabled={state.busy}
            onClick={state.reload}
          >
            Làm mới
          </button>
        </div>
      </div>
      <p role="status" className="text-sm">
        {state.index ? labels[state.index.status] : "Đang tải trạng thái…"}
        {active ? ` · ${state.index?.processed}/${state.index?.total} câu` : ""}
      </p>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.index?.status === "ready" && (
        <>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void state.search(query);
            }}
          >
            <input
              className={field}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={2000}
              placeholder="Tìm câu hỏi theo nội dung hoặc khái niệm…"
              aria-label="Tìm trong quiz"
            />
            <button
              className={`${button} shrink-0`}
              disabled={state.busy || !query.trim()}
            >
              Tìm kiếm
            </button>
          </form>
          {state.matches && (
            <div className="space-y-3">
              {state.matches.length === 0 ? (
                <p>Không tìm thấy câu phù hợp.</p>
              ) : (
                state.matches.map((match) => (
                  <article
                    key={match.question_id}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <p className="mb-2 text-xs font-medium">
                      Câu #{match.question_id}
                    </p>
                    <MarkdownRenderer content={match.content} />
                  </article>
                ))
              )}
            </div>
          )}
          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Duyệt liên kết kiến thức ({state.index.total} câu)
            </summary>
            <ul className="mt-3 space-y-2">
              {state.index.items.map((item) => (
                <li
                  key={item.question_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-[#0D192E]"
                >
                  <span>
                    Câu #{item.question_id} ·{" "}
                    {item.node_name ||
                      (item.node_id
                        ? `Node #${item.node_id}`
                        : item.suggested_node_name
                          ? `Đề xuất: ${item.suggested_node_name}`
                          : "Chưa gắn node")}
                  </span>
                  {!item.node_id && (
                    <div className="flex gap-2">
                      {item.suggested_node_id && (
                        <button
                          className={button}
                          disabled={state.busy}
                          onClick={() =>
                            void state
                              .link({
                                question_id: item.question_id,
                                source_hash: item.source_hash,
                                node_id: item.suggested_node_id!,
                              })
                              .then((ok) => {
                                if (ok) onLinked();
                              })
                          }
                        >
                          Duyệt liên kết
                        </button>
                      )}
                      <button
                        className={button}
                        disabled={state.busy}
                        onClick={() =>
                          void state
                            .suggest(item.question_id, item.source_hash)
                            .then((result) => {
                              if (result) setDraft({ item, ...result });
                            })
                        }
                      >
                        Đề xuất node mới
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <button
                className={button}
                disabled={!state.offset || state.busy}
                onClick={() => state.setOffset(Math.max(0, state.offset - 100))}
              >
                Trước
              </button>
              <span>
                {state.offset + 1}–
                {Math.min(state.offset + 100, state.index.total)} /{" "}
                {state.index.total}
              </span>
              <button
                className={button}
                disabled={state.offset + 100 >= state.index.total || state.busy}
                onClick={() => state.setOffset(state.offset + 100)}
              >
                Sau
              </button>
            </div>
          </details>
        </>
      )}
      {draft && (
        <form
          className="space-y-3 rounded-lg border border-blue-200 p-4 dark:border-blue-800"
          onSubmit={(e) => {
            e.preventDefault();
            void state
              .link({
                question_id: draft.item.question_id,
                source_hash: draft.item.source_hash,
                name: draft.name,
                description: draft.description,
              })
              .then((ok) => {
                if (ok) {
                  setDraft(null);
                  onLinked();
                }
              });
          }}
        >
          <h3 className="font-medium">
            Duyệt node cho câu #{draft.item.question_id}
          </h3>
          <label className="block text-sm">
            Tên khái niệm
            <input
              className={field}
              required
              maxLength={255}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Mô tả
            <textarea
              className={field}
              required
              maxLength={1500}
              rows={3}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </label>
          <p className="text-xs text-slate-500">
            Node trùng tên trong khóa học sẽ được tái sử dụng. Các node hiện có
            không bị tự động gộp.
          </p>
          <div className="flex gap-2">
            <button className={button} disabled={state.busy}>
              Duyệt và gắn node
            </button>
            <button
              type="button"
              className={button}
              disabled={state.busy}
              onClick={() => setDraft(null)}
            >
              Hủy
            </button>
          </div>
        </form>
      )}
      <QuizNodeStatisticsTable nodes={nodes} />
    </section>
  );
}
