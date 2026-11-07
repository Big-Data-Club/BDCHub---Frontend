"use client";
import { useState } from "react";
import {
  CalendarDays,
  Columns3,
  Filter,
  GalleryHorizontal,
  GanttChart,
  List,
  Plus,
  Save,
  Search,
  Settings2,
  Table2,
} from "lucide-react";
import { useWorkspaceDatabase } from "../../hooks/useWorkspaceDatabase";
import { useRelationOptions } from "../../hooks/useRelationOptions";
import { visibleRecords } from "../../utils/databaseViews";
import type {
  PropertyValue,
  ViewType,
  WorkspaceMember,
  WorkspacePage,
} from "../../types";
import {
  WorkspaceButton,
  WorkspaceDialog,
  WorkspaceErrorBanner,
  WorkspaceLoading,
  workspaceInputClass,
} from "../WorkspacePrimitives";
import { DatabaseTable, DatabaseList, DatabaseGallery } from "./DatabaseRows";
import { DatabaseBoard } from "./DatabaseBoard";
import { DatabaseCalendar } from "./DatabaseCalendar";
import { DatabaseTimeline } from "./DatabaseTimeline";
import { DatabaseControls } from "./DatabaseControls";
import { SchemaEditorDialog } from "./SchemaEditorDialog";
const viewIcons = {
  table: Table2,
  board: Columns3,
  calendar: CalendarDays,
  list: List,
  gallery: GalleryHorizontal,
  timeline: GanttChart,
};
const viewNames: [ViewType, string][] = [
  ["table", "Bảng"],
  ["board", "Kanban"],
  ["calendar", "Lịch"],
  ["list", "Danh sách"],
  ["gallery", "Thư viện"],
  ["timeline", "Dòng thời gian"],
];

export function WorkspaceDatabase({
  page,
  pages,
  userId,
  members,
  onOpen,
}: {
  page: WorkspacePage;
  pages: WorkspacePage[];
  userId: string;
  members: WorkspaceMember[];
  onOpen: (id: string) => void;
}) {
  const model = useWorkspaceDatabase(page.id),
    { options: relationOptions } = useRelationOptions(model.data?.fields || []);
  const [query, setQuery] = useState(""),
    [controls, setControls] = useState(false),
    [schemaOpen, setSchemaOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false),
    [recordTitle, setRecordTitle] = useState(""),
    [defaults, setDefaults] = useState<Record<string, PropertyValue>>({});
  const [viewOpen, setViewOpen] = useState(false),
    [viewName, setViewName] = useState(""),
    [viewType, setViewType] = useState<ViewType>("table"),
    [personal, setPersonal] = useState(true);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  if (!model.data || !model.currentView)
    return (
      <>
        <WorkspaceLoading label="Đang tải bảng…" />
        <WorkspaceErrorBanner
          message={model.error}
          retry={() => void model.reload()}
        />
      </>
    );
  const data = model.data,
    editable = data.access >= 3,
    canManage = data.access >= 4;
  const records = visibleRecords(
    data.records,
    data.fields,
    model.config,
    query,
  );
  const fields = data.fields.filter(
    (field) =>
      !model.config.visible_fields ||
      model.config.visible_fields.includes(field.id),
  );
  const props = {
    records,
    fields,
    members,
    editable,
    onOpen,
    onUpdate: model.updateRecord,
    relationOptions,
  };
  const openNew = (values: Record<string, PropertyValue> = {}) => {
    setDefaults(values);
    setRecordTitle("");
    setRecordOpen(true);
    setError(null);
  };
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chưa hoàn thành thao tác.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="min-w-0 space-y-4 pb-16"
      aria-label={`Bảng ${page.title}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2 dark:border-lms-border">
        <div
          className="flex min-w-0 flex-wrap gap-1"
          role="tablist"
          aria-label="Cách xem bảng"
        >
          {data.views.map((view) => {
            const Icon = viewIcons[view.type];
            return (
              <WorkspaceButton
                key={view.id}
                role="tab"
                aria-selected={model.currentView?.id === view.id}
                onClick={() => model.selectView(view.id)}
                className={
                  model.currentView?.id === view.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-cyan-300"
                    : ""
                }
              >
                <Icon className="size-4" />
                {view.name}
                {view.owner_id && (
                  <span className="text-xs opacity-60">cá nhân</span>
                )}
              </WorkspaceButton>
            );
          })}
          {editable && (
            <WorkspaceButton
              aria-label="Thêm cách xem"
              onClick={() => {
                setViewOpen(true);
                setViewName("");
                setPersonal(!canManage);
              }}
            >
              <Plus className="size-4" />
            </WorkspaceButton>
          )}
        </div>
        <div className="flex gap-1">
          <WorkspaceButton
            aria-pressed={controls}
            onClick={() => setControls((value) => !value)}
          >
            <Filter className="size-4" />
            Lọc & sắp xếp
          </WorkspaceButton>
          {canManage && (
            <WorkspaceButton
              aria-label="Quản lý thuộc tính bảng"
              onClick={() => setSchemaOpen(true)}
            >
              <Settings2 className="size-4" />
            </WorkspaceButton>
          )}
          {editable && (
            <WorkspaceButton
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
              onClick={() => openNew()}
            >
              <Plus className="size-4" />
              Mới
            </WorkspaceButton>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-w-0 items-center gap-2 text-slate-500 dark:text-slate-400">
          <Search className="size-4" />
          <input
            aria-label="Tìm trong bảng"
            placeholder="Tìm trong bảng…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${workspaceInputClass} max-w-72 border-transparent bg-transparent dark:border-transparent dark:bg-transparent`}
          />
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {records.length} mục hiển thị · {data.records.length} đã tải
        </span>
      </div>
      {controls && (
        <>
          <DatabaseControls
            fields={data.fields}
            config={model.config}
            onChange={model.setConfig}
            viewType={model.currentView.type}
          />
          {(canManage || model.currentView.owner_id === userId) && (
            <WorkspaceButton
              onClick={() =>
                void run(() => model.saveConfig(model.currentView!))
              }
              disabled={busy}
            >
              <Save className="size-4" />
              Lưu cách xem{" "}
              {model.currentView.owner_id ? "cá nhân" : "dùng chung"}
            </WorkspaceButton>
          )}
          <WorkspaceButton
            onClick={() => {
              model.resetConfig();
              setError(null);
            }}
          >
            Bỏ thay đổi cách xem
          </WorkspaceButton>
        </>
      )}
      <WorkspaceErrorBanner
        message={error || model.error}
        retry={() => void model.reload()}
      />
      {model.currentView.type === "table" && <DatabaseTable {...props} />}
      {model.currentView.type === "board" && (
        <DatabaseBoard
          {...props}
          fields={data.fields}
          groupBy={model.config.group_by}
          onNew={openNew}
        />
      )}
      {model.currentView.type === "calendar" && (
        <DatabaseCalendar
          {...props}
          fields={data.fields}
          dateField={model.config.date_field}
          onNew={openNew}
        />
      )}
      {model.currentView.type === "list" && <DatabaseList {...props} />}
      {model.currentView.type === "gallery" && <DatabaseGallery {...props} />}
      {model.currentView.type === "timeline" && (
        <DatabaseTimeline
          {...props}
          fields={data.fields}
          dateField={model.config.date_field}
        />
      )}
      {data.next_cursor && (
        <WorkspaceButton
          disabled={model.busy}
          onClick={() => void model.loadMore()}
        >
          {model.busy ? "Đang tải…" : "Tải thêm mục để xem đầy đủ"}
        </WorkspaceButton>
      )}
      <SchemaEditorDialog
        open={schemaOpen}
        onOpenChange={setSchemaOpen}
        fields={data.fields}
        version={data.version}
        pages={pages}
        onSave={model.saveSchema}
      />
      <WorkspaceDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        title="Thêm mục"
        description="Mục mới xuất hiện trong các cách xem trên cùng bảng."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await model.createRecord(recordTitle.trim(), defaults);
              setRecordOpen(false);
            });
          }}
        >
          <label className="grid gap-2 text-sm">
            Tên mục
            <input
              autoFocus
              required
              maxLength={300}
              className={workspaceInputClass}
              value={recordTitle}
              onChange={(event) => setRecordTitle(event.target.value)}
            />
          </label>
          <WorkspaceErrorBanner message={error} />
          <WorkspaceButton
            type="submit"
            disabled={busy || !recordTitle.trim()}
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
          >
            {busy ? "Đang tạo…" : "Tạo mục"}
          </WorkspaceButton>
        </form>
      </WorkspaceDialog>
      <WorkspaceDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        title="Thêm cách xem"
        description="Mỗi cách xem dùng chung các mục và có cấu hình hiển thị riêng."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await model.createView(viewName.trim(), viewType, personal);
              setViewOpen(false);
            });
          }}
        >
          <label className="grid gap-2 text-sm">
            Tên cách xem
            <input
              autoFocus
              required
              maxLength={80}
              className={workspaceInputClass}
              value={viewName}
              onChange={(event) => setViewName(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm">
            Bố cục
            <select
              className={workspaceInputClass}
              value={viewType}
              onChange={(event) => setViewType(event.target.value as ViewType)}
            >
              {viewNames.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={personal}
              disabled={!canManage}
              onChange={(event) => setPersonal(event.target.checked)}
            />
            Cấu hình chỉ dành cho mình
          </label>
          <WorkspaceErrorBanner message={error} />
          <WorkspaceButton
            type="submit"
            disabled={busy || !viewName.trim()}
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
          >
            Tạo cách xem
          </WorkspaceButton>
        </form>
      </WorkspaceDialog>
    </section>
  );
}
