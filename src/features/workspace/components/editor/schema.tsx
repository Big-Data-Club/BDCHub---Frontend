"use client";
import {
  BlockNoteSchema,
  createExtension,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultProps,
  type BlockNoteEditor,
} from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import {
  createReactInlineMathSpec,
  createReactMathBlockSpec,
} from "@blocknote/math-block";
import { inputRules, InputRule } from "@handlewithcare/prosemirror-inputrules";
import { TextSelection } from "prosemirror-state";
import { FileText, MoreHorizontal, Plus } from "lucide-react";
import { useWorkspaceEditorContext } from "./EditorContext";

const closingDollars = createExtension({
  key: "bdc-closing-equation",
  prosemirrorPlugins: [
    inputRules({
      rules: [
        new InputRule(
          /(?:^|[^\\$])\$\$([^$\n]+)\$\$$/,
          (state, match, start, end) => {
            if (
              !match[1].trim() ||
              state.selection.$from.parent.type.spec.code ||
              state.selection.$from
                .marks()
                .some((mark) => mark.type.name === "code")
            )
              return null;
            const from = end - match[1].length - 4,
              node = state.schema.nodes.math.create(
                null,
                state.schema.text(match[1]),
              );
            const transaction = state.tr.replaceWith(from, end, node);
            return transaction.setSelection(
              TextSelection.create(transaction.doc, from + node.nodeSize),
            );
          },
        ),
      ],
    }),
  ],
});
const linkedPage = createReactBlockSpec(
  {
    type: "pageLink",
    propSchema: {
      pageId: { default: "" },
      title: { default: "" },
      textColor: defaultProps.textColor,
      backgroundColor: defaultProps.backgroundColor,
    },
    content: "none",
  },
  {
    render: function PageReference({ block }) {
      const context = useWorkspaceEditorContext(),
        target = context?.pages.find((page) => page.id === block.props.pageId);
      return (
        <div
          contentEditable={false}
          className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-lms-hover"
        >
          <FileText className="size-4 shrink-0" />
          <a
            href={`/workspace?page=${block.props.pageId}`}
            onClick={(event) => {
              if (!event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                context?.onOpen(block.props.pageId);
              }
            }}
            className="min-w-0 flex-1 font-medium underline decoration-slate-300 underline-offset-4"
          >
            {target?.title || block.props.title || "Trang"}
          </a>
          {target?.kind === "page" &&
            context?.page.space_role &&
            (context.page.access || 0) >= 3 && (
              <button
                type="button"
                aria-label="Tạo trang con"
                className="rounded p-1 active:scale-95"
                onClick={() => {
                  void context
                    .onCreateChild("Trang không tiêu đề", target.id)
                    .catch(() => context.onPageMenu(target.id));
                }}
              >
                <Plus className="size-4" />
              </button>
            )}
          <button
            type="button"
            aria-label="Thao tác trang liên kết"
            className="rounded p-1 active:scale-95"
            onClick={() => context?.onPageMenu(block.props.pageId)}
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      );
    },
    toExternalHTML: ({ block }) => (
      <a href={`/workspace?page=${block.props.pageId}`}>
        {block.props.title || "Trang"}
      </a>
    ),
  },
)();
export const workspaceSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    pageLink: linkedPage,
    mathBlock: { ...createReactMathBlockSpec(), extensions: [closingDollars] },
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    math: { ...createReactInlineMathSpec(), extensions: [] },
  },
});
export type WorkspaceBlock = typeof workspaceSchema.Block;
export type WorkspaceEditorInstance = BlockNoteEditor<
  typeof workspaceSchema.blockSchema,
  typeof workspaceSchema.inlineContentSchema,
  typeof workspaceSchema.styleSchema
>;

export function parseWorkspaceMarkdown(
  editor: WorkspaceEditorInstance,
  markdown: string,
) {
  const blocks: WorkspaceBlock[] = [];
  let chunk: string[] = [],
    math: string[] | null = null,
    fence = "";
  function flush() {
    if (!chunk.length) return;
    const parsed = editor.tryParseMarkdownToBlocks(chunk.join("\n"));
    const visit = (value: unknown): unknown => {
      if (Array.isArray(value))
        return value.flatMap((item) => {
          if (
            item &&
            typeof item === "object" &&
            "type" in item &&
            item.type === "text" &&
            "text" in item &&
            typeof item.text === "string"
          ) {
            const result: unknown[] = [];
            const expression =
              /(?<![\\$])\$\$([^$\n]+)\$\$(?!\$)|(?<![\\$])\$([^$\n]+)\$(?!\$)/g;
            let from = 0;
            for (const match of item.text.matchAll(expression)) {
              if ((match.index || 0) > from)
                result.push({
                  ...item,
                  text: item.text.slice(from, match.index),
                });
              result.push({ type: "math", content: match[1] || match[2] });
              from = (match.index || 0) + match[0].length;
            }
            if (from < item.text.length)
              result.push({ ...item, text: item.text.slice(from) });
            return result.length ? result : [item];
          }
          return [visit(item)];
        });
      if (!value || typeof value !== "object") return value;
      const object = value as Record<string, unknown>;
      if (object.type === "codeBlock") return object;
      return Object.fromEntries(
        Object.entries(object).map(([key, child]) => [key, visit(child)]),
      );
    };
    blocks.push(...(visit(parsed) as WorkspaceBlock[]));
    chunk = [];
  }
  for (const line of markdown.split("\n")) {
    const trimmed = line.trim();
    if (!math && /^(```|~~~)/.test(trimmed)) {
      const marker = trimmed.slice(0, 3);
      fence = fence ? (fence === marker ? "" : fence) : marker;
    }
    if (!fence && trimmed === "$$") {
      if (math) {
        blocks.push({
          id: crypto.randomUUID(),
          type: "mathBlock",
          props: {},
          content: [{ type: "text", text: math.join("\n"), styles: {} }],
          children: [],
        });
        math = null;
      } else {
        flush();
        math = [];
      }
    } else if (math) math.push(line);
    else chunk.push(line);
  }
  if (math) chunk.push("$$", ...math);
  flush();
  return blocks;
}
