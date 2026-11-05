"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BlockNoteEditor } from "@blocknote/core";
import { vi } from "@blocknote/core/locales";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { blocksToYDoc, withCollaboration } from "@blocknote/core/yjs";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  getDefaultReactSlashMenuItems,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { getMathSlashMenuItems } from "@blocknote/math-block";
import { useTheme } from "next-themes";
import * as Y from "yjs";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "katex/contrib/mhchem";
import "katex/dist/katex.min.css";
import { BookOpen, FilePlus2, ImagePlus } from "lucide-react";
import { workspaceService, WorkspaceError } from "../../api/workspaceService";
import {
  decodeUpdate,
  encodeUpdate,
  type WorkspaceProvider,
} from "../../api/WorkspaceProvider";
import { useWorkspaceProvider } from "../../hooks/useWorkspaceProvider";
import { useEditorCommands } from "../../hooks/useEditorCommands";
import type {
  CollaborationStatus,
  EditorActions,
  WorkspacePage,
  WorkspaceUser,
} from "../../types";
import {
  WorkspaceButton,
  WorkspaceErrorBanner,
  WorkspaceLoading,
} from "../WorkspacePrimitives";
import { downloadWorkspaceFile } from "../../utils/editorContent";
import { EditorBlockMenu } from "./EditorBlockMenu";
import { WorkspaceEditorContext } from "./EditorContext";
import { parseWorkspaceMarkdown, workspaceSchema } from "./schema";
import styles from "./WorkspaceEditor.module.css";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";

interface WorkspaceEditorProps {
  page: WorkspacePage;
  user: WorkspaceUser;
  pages: WorkspacePage[];
  onRefresh: () => void;
  onOpen: (id: string) => void;
  onGuide: () => void;
  onAskAi: (text: string) => void;
  onComment: (blockId: string) => void;
  onPageMenu: (id: string) => void;
  onCreateChild: (title: string, parentId?: string) => Promise<WorkspacePage>;
  onActions: (actions: EditorActions | null) => void;
  onStatus: (status: CollaborationStatus) => void;
}
export function WorkspaceEditor(props: WorkspaceEditorProps) {
  const { provider, status } = useWorkspaceProvider(
    props.page.id,
    props.page.generation || 1,
    props.user,
    props.onRefresh,
  );
  const [initialized, setInitialized] = useState(false),
    [initialError, setInitialError] = useState<string | null>(null);
  const initGeneration = useRef(0);
  const { onStatus } = props;
  useEffect(() => {
    onStatus(status);
  }, [status, onStatus]);
  useEffect(() => {
    if (!provider || status.access < 1 || status.state === "connecting") return;
    const current = ++initGeneration.current;
    let cancelled = false;
    const initialize = async () => {
      if (
        props.page.initial_markdown &&
        Number(props.page.revision) === 0 &&
        !provider.doc.getXmlFragment("document-store").length &&
        status.access >= 3
      ) {
        const temporary = BlockNoteEditor.create({ schema: workspaceSchema });
        const seed = blocksToYDoc(
          temporary,
          parseWorkspaceMarkdown(temporary, props.page.initial_markdown),
          "document-store",
        );
        try {
          await workspaceService.initialize(
            props.page.id,
            encodeUpdate(Y.encodeStateAsUpdate(seed)),
            props.page.generation || 1,
          );
        } catch (reason) {
          if (
            !(
              reason instanceof WorkspaceError &&
              reason.code === "already_initialized"
            )
          )
            throw reason;
        } finally {
          seed.destroy();
        }
        const saved = await workspaceService.document(props.page.id);
        if (saved.generation !== provider.generation)
          throw new Error("Trang đã đổi phiên bản. Tải lại để tiếp tục.");
        if (saved.state) Y.applyUpdate(provider.doc, decodeUpdate(saved.state));
      }
      if (!cancelled && current === initGeneration.current) {
        setInitialized(true);
        setInitialError(null);
      }
    };
    void initialize().catch((reason) => {
      if (!cancelled)
        setInitialError(
          reason instanceof Error
            ? reason.message
            : "Chưa khởi tạo được nội dung.",
        );
    });
    return () => {
      cancelled = true;
    };
  }, [
    provider,
    status.access,
    status.state,
    props.page.id,
    props.page.generation,
    props.page.initial_markdown,
    props.page.revision,
  ]);
  if (
    status.access > 0 &&
    status.access < 3 &&
    Number(props.page.revision) === 0 &&
    props.page.initial_markdown
  )
    return (
      <div className="px-5 pb-12 sm:px-10">
        <MarkdownRenderer content={props.page.initial_markdown} />
      </div>
    );
  if (!provider || !initialized)
    return (
      <>
        <WorkspaceLoading
          label={
            status.state === "offline"
              ? "Đang chờ kết nối để mở trang…"
              : "Đang đồng bộ trang…"
          }
        />
        <WorkspaceErrorBanner
          message={initialError || status.message || null}
          retry={() => provider?.retry()}
        />
      </>
    );
  return (
    <>
      {["offline", "revoked", "restored", "error"].includes(status.state) && (
        <div className="mx-4 mb-4 space-y-2">
          <WorkspaceErrorBanner
            message={status.message || "Nội dung chưa được lưu trên máy chủ."}
            retry={
              status.state === "error" ? () => provider.retry() : undefined
            }
          />
          <div className="flex flex-wrap gap-2">
            <WorkspaceButton
              onClick={() =>
                downloadWorkspaceFile(
                  `${props.page.title}-ban-nhap.json`,
                  provider.exportDraft(),
                  "application/json",
                )
              }
            >
              Tải bản nháp
            </WorkspaceButton>
            {["restored", "revoked"].includes(status.state) && (
              <WorkspaceButton onClick={() => location.reload()}>
                Tải lại trang
              </WorkspaceButton>
            )}
          </div>
        </div>
      )}
      <RichEditor
        key={`${props.page.id}:${provider.doc.clientID}`}
        {...props}
        provider={provider}
        status={status}
      />
    </>
  );
}
function RichEditor({
  provider,
  status,
  ...props
}: WorkspaceEditorProps & {
  provider: WorkspaceProvider;
  status: CollaborationStatus;
}) {
  const { resolvedTheme } = useTheme();
  const uploadInput = useRef<HTMLInputElement>(null);
  const editor = useCreateBlockNote(
    withCollaboration({
      schema: workspaceSchema,
      dictionary: vi,
      uploadFile: async (file) =>
        (await workspaceService.upload(props.page.id, file)).url,
      collaboration: {
        fragment: provider.doc.getXmlFragment("document-store"),
        provider,
        user: { name: props.user.name, color: "#2563eb" },
        showCursorLabels: "activity",
      },
    }),
    [provider],
  );
  const { error, setError, convertBlock } = useEditorCommands(
    editor,
    props.page,
    props.onCreateChild,
    props.onActions,
  );
  useEffect(() => {
    editor.isEditable = provider.editable;
  }, [editor, provider, status]);
  const { onCreateChild } = props;
  const currentPageId = props.page.id;
  const createChild = useCallback(async () => {
    try {
      const child = await onCreateChild("Trang không tiêu đề", currentPageId);
      editor.insertBlocks(
        [{ type: "pageLink", props: { pageId: child.id, title: child.title } }],
        editor.getTextCursorPosition().block,
        "after",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa tạo được trang con.",
      );
    }
  }, [editor, onCreateChild, currentPageId, setError]);
  const context = {
    page: props.page,
    pages: props.pages,
    onOpen: props.onOpen,
    onGuide: props.onGuide,
    onAskAi: props.onAskAi,
    onComment: props.onComment,
    onPageMenu: props.onPageMenu,
    onCreateChild: props.onCreateChild,
    onConvertBlock: (id: string) => {
      void convertBlock(id);
    },
  };
  useEffect(() => {
    const block = new URLSearchParams(location.search).get("block");
    if (block && editor.getBlock(block)) {
      editor.setTextCursorPosition(block, "start");
      const element = document.querySelector(
        `[data-id="${CSS.escape(block)}"]`,
      );
      element?.scrollIntoView({ block: "center" });
    }
  }, [editor]);
  return (
    <WorkspaceEditorContext.Provider value={context}>
      <div className={styles.editor}>
        <WorkspaceErrorBanner message={error} />
        {provider.editable && (
          <div className="mb-2 flex flex-wrap gap-1 px-4 sm:px-10">
            <WorkspaceButton onClick={() => uploadInput.current?.click()}>
              <ImagePlus className="size-4" />
              Ảnh / tệp
            </WorkspaceButton>
            <WorkspaceButton onClick={props.onGuide}>
              <BookOpen className="size-4" />
              LaTeX
            </WorkspaceButton>
            <input
              ref={uploadInput}
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              aria-label="Tải ảnh hoặc tệp lên trang"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void workspaceService
                  .upload(props.page.id, file)
                  .then((result) => {
                    if (!provider.editable) return;
                    editor.insertBlocks(
                      [
                        result.mime.startsWith("image/")
                          ? {
                              type: "image",
                              props: {
                                url: result.url,
                                caption: "",
                                name: result.name,
                              },
                            }
                          : {
                              type: "file",
                              props: { url: result.url, name: result.name },
                            },
                      ],
                      editor.getTextCursorPosition().block,
                      "after",
                    );
                  })
                  .catch((reason) =>
                    setError(
                      reason instanceof Error
                        ? reason.message
                        : "Chưa tải được tệp.",
                    ),
                  );
                event.target.value = "";
              }}
            />
          </div>
        )}
        <BlockNoteView
          editor={editor}
          editable={provider.editable}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          sideMenu={false}
          slashMenu={false}
        >
          <SideMenuController
            sideMenu={(menuProps) => (
              <SideMenu {...menuProps} dragHandleMenu={EditorBlockMenu} />
            )}
          />
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(
                [
                  ...getDefaultReactSlashMenuItems(editor),
                  ...getMathSlashMenuItems(editor),
                  ...(props.page.space_role
                    ? [
                        {
                          title: "Trang con",
                          aliases: ["page", "subpage", "trang"],
                          group: "Workspace",
                          icon: <FilePlus2 className="size-4" />,
                          onItemClick: () => {
                            void createChild();
                          },
                        },
                      ]
                    : []),
                  {
                    title: "Hướng dẫn LaTeX",
                    aliases: ["guide", "latex", "cong thuc"],
                    group: "Workspace",
                    icon: <BookOpen className="size-4" />,
                    onItemClick: props.onGuide,
                  },
                ],
                query,
              )
            }
          />
        </BlockNoteView>
      </div>
    </WorkspaceEditorContext.Provider>
  );
}
