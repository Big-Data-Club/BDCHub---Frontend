"use client";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspacePageHeading } from "./WorkspacePageHeading";
import { WorkspaceLanding } from "./fields/WorkspaceLanding";
import { useWorkspaceSidebar } from "../hooks/useWorkspaceSidebar";
import { useWorkspaceTabs } from "../hooks/useWorkspaceTabs";
import { usePageVisit } from "../hooks/usePageVisit";
import { WorkspaceSidebarEdge } from "./WorkspaceSidebarEdge";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { WorkspaceTabPicker } from "./WorkspaceTabPicker";
import chrome from "./WorkspaceChrome.module.css";
import { pageAncestors } from "../utils/pageHierarchy";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { BookOpen, X } from "lucide-react";
import { useWorkspace } from "../hooks/useWorkspace";
import { workspaceService } from "../api/workspaceService";
import type { InspectorTab } from "../hooks/useWorkspacePanel";
import type {
  CollaborationStatus,
  EditorActions,
  WorkspaceMember,
  WorkspacePage,
} from "../types";
import { downloadWorkspaceFile } from "../utils/editorContent";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { type PageAction } from "./WorkspacePageMenu";
import {
  WorkspaceDialogs,
  type WorkspaceDialogState,
} from "./WorkspaceDialogs";
import { WorkspaceInspector } from "./WorkspaceInspector";
import { WorkspaceGuide } from "./WorkspaceGuide";
import { WorkspaceDatabase } from "./database/WorkspaceDatabase";
import {
  WorkspaceButton,
  WorkspaceErrorBanner,
  WorkspaceLoading,
} from "./WorkspacePrimitives";
const Editor = dynamic(
  () =>
    import("./editor/WorkspaceEditor").then((module) => module.WorkspaceEditor),
  { ssr: false, loading: () => <WorkspaceLoading label="Đang mở editor…" /> },
);

export function WorkspaceClient() {
  const model = useWorkspace(),
    { page, bootstrap, refresh: reload, navigate } = model;
  const pageId = page?.id,
    pageSpaceId = page?.space_id,
    spaceRole = page?.space_role;
  const sidebar = useWorkspaceSidebar(bootstrap?.user.id);
  usePageVisit(pageId);
  const [dialog, setDialog] = useState<WorkspaceDialogState>(null),
    [mobile, setMobile] = useState(false),
    [tabPicker, setTabPicker] = useState(false),
    [guide, setGuide] = useState(false),
    [tab, setTab] = useState<InspectorTab | null>(null),
    [selection, setSelection] = useState(""),
    [blockId, setBlockId] = useState<string>(),
    [status, setStatus] = useState<CollaborationStatus>({
      state: "connecting",
      pending: 0,
      access: 0,
    }),
    [members, setMembers] = useState<WorkspaceMember[]>([]),
    [peek, setPeek] = useState<WorkspacePage | null>(null),
    [toast, setToast] = useState("");
  const editor = useRef<EditorActions | null>(null),
    pendingPanel = useRef<{
      pageId: string;
      tab: InspectorTab;
      text?: string;
      blockId?: string;
    } | null>(null),
    importInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const pending =
      pendingPanel.current?.pageId === pageId ? pendingPanel.current : null;
    pendingPanel.current = null;
    setTab(pending?.tab || null);
    setSelection(pending?.text || "");
    setPeek(null);
    setGuide(false);
    setBlockId(pending?.blockId);
    setStatus({ state: "connecting", pending: 0, access: 0 });
    editor.current = null;
    setMembers([]);
    if (pageId)
      void workspaceService
        .sharing(pageId)
        .then((value) =>
          setMembers([
            ...new Map(
              value.members.map((member) => [member.id, member]),
            ).values(),
          ]),
        )
        .catch(() => {});
  }, [pageId, pageSpaceId, spaceRole]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const onActions = useCallback((actions: EditorActions | null) => {
      editor.current = actions;
    }, []),
    onStatus = useCallback(
      (value: CollaborationStatus) => setStatus(value),
      [],
    );
  const open = useCallback(
    (id?: string, space?: string) => {
      navigate(id, space);
      setMobile(false);
    },
    [navigate],
  );
  const tabModel = useWorkspaceTabs(page, open);
  const { setCollapsed } = sidebar;
  const toggleSidebar = useCallback(() => {
    if (innerWidth >= 1024) setCollapsed((value) => !value);
    else setMobile((value) => !value);
  }, [setCollapsed]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.code === "Backslash" &&
        !event.repeat
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [toggleSidebar]);
  useEffect(() => {
    if (sidebar.collapsed)
      document.getElementById("workspace-sidebar-toggle")?.focus();
  }, [sidebar.collapsed]);
  const refresh = useCallback(() => {
    void reload();
  }, [reload]);
  const createChild = useCallback(
    async (title: string, parentId?: string) => {
      if (!spaceRole || !pageSpaceId || !pageId)
        throw Error("Bạn cần quyền tạo trang trong không gian.");
      const created = await workspaceService.createPage(pageSpaceId, {
        title,
        parent_id: parentId || pageId,
      });
      await reload();
      return created;
    },
    [pageId, pageSpaceId, spaceRole, reload],
  );
  const panel = useCallback(
    (value: InspectorTab, text?: string, block?: string) => {
      setSelection(text ?? editor.current?.selectionText() ?? "");
      setBlockId(block);
      setTab(value);
      setGuide(false);
    },
    [],
  );
  const createWithLink = async (
    title: string,
    kind: "page" | "database",
    parentId?: string,
    template?: string,
  ) => {
    if (parentId === pageId && pageSpaceId && editor.current) {
      const child = await workspaceService.createPage(pageSpaceId, {
        title,
        kind,
        parent_id: parentId,
        template,
      });
      editor.current.insertPageLink(child);
      await reload();
      open(child.id);
      return child;
    }
    return model.createPage(title, kind, parentId, template);
  };
  async function action(type: PageAction, target: WorkspacePage) {
    try {
      if (["rename", "appearance", "move", "archive"].includes(type)) {
        const current = target.access
          ? target
          : await workspaceService.page(target.id);
        setDialog({ type: type as "rename", page: current });
        return;
      }
      if (type === "favorite") {
        await workspaceService.favorite(target.id, !target.favorite);
        await reload();
      }
      if (type === "link") {
        await navigator.clipboard.writeText(
          `${location.origin}/workspace?page=${target.id}`,
        );
        setToast("Đã sao chép liên kết");
      }
      if (type === "duplicate") {
        const created = await workspaceService.duplicate(target.id);
        await reload();
        open(created.id);
      }
      if (type === "share") {
        if (target.id !== page?.id) {
          pendingPanel.current = { pageId: target.id, tab: "sharing" };
          open(target.id);
        } else setTab("sharing");
      }
      if (type === "peek") setPeek(await workspaceService.page(target.id));
      if (type === "export") {
        if (target.id !== page?.id)
          throw Error("Mở trang này trước khi xuất nội dung.");
        if (!editor.current) throw Error("Đợi nội dung trang đồng bộ xong.");
        downloadWorkspaceFile(
          `${target.title}.md`,
          await editor.current.exportMarkdown(),
          "text/markdown;charset=utf-8",
        );
      }
      if (type === "import") {
        if (target.id !== page?.id)
          throw Error("Mở trang này trước khi thêm nội dung.");
        importInput.current?.click();
      }
    } catch (reason) {
      model.setError(
        reason instanceof Error ? reason.message : "Chưa hoàn thành thao tác.",
      );
    }
  }
  if (model.loading && !bootstrap) return <WorkspaceLoading />;
  if (!bootstrap)
    return (
      <div className="p-6">
        <WorkspaceErrorBanner
          message={model.error || "Chưa mở được Workspace."}
          retry={refresh}
        />
      </div>
    );
  const access = page?.access || 0,
    editable = access >= 3,
    manager = Boolean(
      page && ["owner", "manager"].includes(page.space_role || ""),
    );
  const dialogs = (
    <WorkspaceDialogs
      value={dialog}
      onClose={() => setDialog(null)}
      space={model.activeSpace}
      pages={model.allPages}
      bootstrap={bootstrap}
      onRefresh={model.refresh}
      onOpen={open}
      onCreate={createWithLink}
    />
  );
  if (model.isLanding)
    return (
      <>
        <WorkspaceLanding
          bootstrap={bootstrap}
          space={model.activeSpace}
          error={model.error}
          onRefresh={reload}
          onSpace={(id) => navigate(undefined, id)}
          onField={(field) => navigate(field.page_id, field.space_id, field.id)}
          onPage={(id) => open(id)}
          onCreateSpace={() => setDialog({ type: "team" })}
          onInbox={() => setDialog({ type: "inbox" })}
          onTrash={() => setDialog({ type: "trash" })}
        />
        {dialogs}
      </>
    );
  return (
    <div
      key={model.field?.id || page?.space_id || "shared"}
      className={`${chrome.shell} ${chrome.enter}`}
      style={
        { "--workspace-sidebar-width": `${sidebar.width}px` } as CSSProperties
      }
    >
      {mobile && (
        <button
          aria-label="Đóng cây trang"
          type="button"
          className="absolute inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="workspace-page-sidebar"
        className={chrome.sidebar}
        data-mobile={mobile || undefined}
        data-collapsed={sidebar.collapsed || undefined}
      >
        <WorkspaceSidebar
          bootstrap={bootstrap}
          space={model.activeSpace}
          pages={model.pages}
          activeId={page?.id}
          field={model.field}
          onHome={() => navigate(undefined, model.activeSpace?.id)}
          onField={(id) => navigate(undefined, model.activeSpace?.id, id)}
          onOpen={open}
          onCreate={(parent) => setDialog({ type: "create", parent })}
          onCreateSpace={() => setDialog({ type: "team" })}
          onGuide={() => {
            setGuide(true);
            setMobile(false);
          }}
          onTrash={() => setDialog({ type: "trash" })}
          onNotes={() => setDialog({ type: "notes" })}
          onInbox={() => setDialog({ type: "inbox" })}
          onMove={(id, parent_id) => {
            void workspaceService
              .page(id)
              .then((current) =>
                workspaceService.updatePage(id, {
                  version: current.version,
                  parent_id,
                }),
              )
              .then(() => reload())
              .catch((reason) => model.setError(reason.message));
          }}
        />
        {!sidebar.collapsed && <WorkspaceSidebarEdge controls={sidebar} />}
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <WorkspaceTabs
          model={tabModel}
          activeId={page?.id}
          onAdd={() => setTabPicker(true)}
          onSidebar={toggleSidebar}
          sidebarOpen={sidebar.isDesktop ? !sidebar.collapsed : mobile}
        />
        {tabPicker && (
          <WorkspaceTabPicker
            bootstrap={bootstrap}
            fieldId={model.field?.id}
            canCreate={
              !!model.activeSpace &&
              ["owner", "manager", "editor"].includes(model.activeSpace.role)
            }
            onClose={() => setTabPicker(false)}
            onOpen={(id) => {
              setTabPicker(false);
              open(id);
            }}
            onNew={() => {
              setTabPicker(false);
              setDialog({ type: "create" });
            }}
          />
        )}
        {page && (
          <WorkspaceHeader
            page={page}
            status={status}
            spaceName={model.activeSpace?.title}
            fieldName={model.field?.title}
            ancestors={pageAncestors(page, model.allPages)}
            onFieldHome={
              model.field
                ? () =>
                    navigate(undefined, model.activeSpace?.id, model.field!.id)
                : undefined
            }
            onHome={() => navigate(undefined, model.activeSpace?.id)}
            parentTitle={
              model.pages.find((item) => item.id === page.parent_id)?.title
            }
            manager={manager}
            onOpen={(id) => open(id)}
            onPanel={panel}
            onAction={(type, target) => void action(type, target)}
            setTab={setTab}
          />
        )}
        <div className="flex min-h-0 min-w-0 flex-1">
          <main
            data-workspace-scroll
            className={`min-h-0 min-w-0 flex-1 overflow-y-auto ${guide ? "hidden" : ""}`}
          >
            <div className="px-4 pt-3">
              <WorkspaceErrorBanner message={model.error} retry={refresh} />
            </div>
            {page ? (
              <div
                className={`mx-auto w-full ${page.full_width || page.kind === "database" ? "max-w-none" : "max-w-4xl"}`}
              >
                <WorkspacePageHeading
                  page={page}
                  field={model.field}
                  editable={editable}
                  onCustomize={() => setDialog({ type: "appearance", page })}
                  onSave={async (title, version) => {
                    await model.patch({ title, version });
                  }}
                />
                <Editor
                  key={`${page.id}:${page.generation}`}
                  page={page}
                  pages={model.allPages}
                  user={bootstrap.user}
                  onRefresh={refresh}
                  onOpen={(id) => open(id)}
                  onGuide={() => setGuide(true)}
                  onAskAi={(text) => panel("ai", text)}
                  onComment={(id) => panel("comments", undefined, id)}
                  onPageMenu={(id) => {
                    void workspaceService
                      .page(id)
                      .then((target) =>
                        setDialog({ type: "rename", page: target }),
                      )
                      .catch((reason) => model.setError(reason.message));
                  }}
                  onCreateChild={createChild}
                  onActions={onActions}
                  onStatus={onStatus}
                />
                {page.kind === "database" && (
                  <div className="px-5 sm:px-10">
                    <WorkspaceDatabase
                      key={page.id}
                      page={page}
                      pages={model.allPages}
                      members={members}
                      userId={bootstrap.user.id}
                      onOpen={(id) => open(id)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto max-w-lg space-y-4 px-6 py-20">
                <BookOpen className="size-10 text-blue-500" />
                <h1 className="text-2xl font-semibold">
                  Không gian cho ý tưởng của bạn
                </h1>
                <p className="text-sm leading-7 text-slate-500">
                  Tạo một trang ghi chép hoặc bảng quản lý. Bạn cũng có thể mở
                  trang được chia sẻ trong cây bên cạnh.
                </p>
                <WorkspaceButton onClick={() => setDialog({ type: "create" })}>
                  Tạo trang đầu tiên
                </WorkspaceButton>
              </div>
            )}
          </main>
          {guide && (
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <WorkspaceGuide
                onClose={() => setGuide(false)}
                onInsert={
                  editable
                    ? (formula) => {
                        editor.current?.insertMath(formula);
                        setGuide(false);
                      }
                    : undefined
                }
              />
            </div>
          )}
          {tab && page && !guide && (
            <div className="absolute inset-y-0 right-0 z-20 w-full max-w-md shadow-xl xl:relative xl:shadow-none">
              <WorkspaceInspector
                key={page.id}
                page={page}
                space={model.activeSpace}
                user={bootstrap.user}
                tab={tab}
                onTab={setTab}
                onClose={() => setTab(null)}
                onRefresh={refresh}
                onOpen={(id) => open(id)}
                editor={editor.current}
                selection={selection}
                blockId={blockId}
              />
            </div>
          )}
        </div>
      </div>
      {peek && (
        <div className="absolute inset-y-0 right-0 z-30 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl dark:border-lms-border dark:bg-lms-bg">
          <div className="flex items-center justify-between border-b p-3 dark:border-lms-border">
            <WorkspaceButton onClick={() => open(peek.id)}>
              Mở {peek.title}
            </WorkspaceButton>
            <WorkspaceButton
              aria-label="Đóng trang bên cạnh"
              onClick={() => setPeek(null)}
            >
              <X className="size-4" />
            </WorkspaceButton>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <h2 className="px-10 py-8 text-2xl font-bold">{peek.title}</h2>
            <Editor
              key={`peek:${peek.id}:${peek.generation}`}
              page={peek}
              pages={model.pages}
              user={bootstrap.user}
              onRefresh={() => {
                void workspaceService
                  .page(peek.id)
                  .then(setPeek)
                  .catch(() => setPeek(null));
              }}
              onOpen={(id) => open(id)}
              onGuide={() => {
                setPeek(null);
                setGuide(true);
              }}
              onAskAi={(text) => {
                setPeek(null);
                pendingPanel.current = { pageId: peek.id, tab: "ai", text };
                open(peek.id);
                if (peek.id === pageId) panel("ai", text);
              }}
              onComment={(id) => {
                setPeek(null);
                pendingPanel.current = {
                  pageId: peek.id,
                  tab: "comments",
                  blockId: id,
                };
                open(peek.id);
                if (peek.id === pageId) panel("comments", undefined, id);
              }}
              onPageMenu={(id) => open(id)}
              onCreateChild={async (title) => {
                const created = await workspaceService.createPage(
                  peek.space_id,
                  { title, parent_id: peek.id },
                );
                refresh();
                return created;
              }}
              onActions={() => {}}
              onStatus={() => {}}
            />
          </div>
        </div>
      )}
      {dialogs}
      <input
        ref={importInput}
        aria-label="Nhập nội dung Markdown"
        className="hidden"
        type="file"
        accept=".md,.markdown,.txt"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (file.size > 1000000) {
            model.setError("Tệp nội dung tối đa 1 MB.");
            return;
          }
          void file
            .text()
            .then(async (text) => {
              if (!editor.current) throw Error("Đợi trang đồng bộ xong.");
              await editor.current.insertMarkdown(text);
              setToast("Đã thêm nội dung vào trang");
            })
            .catch((reason) => model.setError(reason.message));
        }}
      />
      {toast && (
        <div
          role="status"
          className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-white dark:text-slate-900"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
