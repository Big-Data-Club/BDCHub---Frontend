"use client";
import { FileText, ArrowUpRight } from "lucide-react";
import type {
  DatabaseField,
  PropertyValue,
  WorkspaceMember,
  WorkspacePage,
} from "../../types";
import { propertyText } from "../../utils/databaseViews";
import { PropertyCell } from "./PropertyCell";
import { WorkspaceButton } from "../WorkspacePrimitives";
export interface RecordViewProps {
  records: WorkspacePage[];
  fields: DatabaseField[];
  members: WorkspaceMember[];
  editable: boolean;
  onOpen: (id: string) => void;
  onUpdate: (
    record: WorkspacePage,
    values: Record<string, PropertyValue>,
    version?: number,
    title?: string,
  ) => Promise<unknown>;
  relationOptions: Record<string, WorkspacePage[]>;
}
export function DatabaseTable({
  records,
  fields,
  members,
  editable,
  onOpen,
  onUpdate,
  relationOptions,
}: RecordViewProps) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 dark:border-lms-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 dark:bg-lms-input dark:text-slate-400">
          <tr>
            <th scope="col" className="min-w-60 px-4 py-3 font-medium">
              Tên
            </th>
            {fields.map((field) => (
              <th
                key={field.id}
                scope="col"
                className="min-w-36 px-3 py-3 font-medium"
              >
                {field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-t border-slate-200 hover:bg-slate-50/70 dark:border-lms-border dark:hover:bg-lms-hover/40"
            >
              <th scope="row" className="px-3 py-2 font-medium">
                <button
                  type="button"
                  className="flex w-full items-start gap-2 rounded-lg px-1 py-2 text-left transition-all active:scale-95"
                  onClick={() => onOpen(record.id)}
                >
                  <FileText className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">{record.title}</span>
                  <ArrowUpRight className="size-3 shrink-0 text-slate-400" />
                </button>
              </th>
              {fields.map((field) => (
                <td key={field.id} className="px-2 py-2 align-top">
                  <PropertyCell
                    field={field}
                    record={record}
                    members={members}
                    editable={editable}
                    relationOptions={
                      relationOptions[field.relation_page_id || ""]
                    }
                    onSave={(values, version) =>
                      onUpdate(record, values, version)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!records.length && (
        <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Chưa có mục phù hợp trong dữ liệu đã tải.
        </p>
      )}
    </div>
  );
}
export function DatabaseList({ records, fields, onOpen }: RecordViewProps) {
  return (
    <div className="divide-y divide-slate-200 dark:divide-lms-border">
      {records.map((record) => (
        <WorkspaceButton
          key={record.id}
          onClick={() => onOpen(record.id)}
          className="h-auto w-full justify-start gap-3 rounded-none py-4 text-left"
        >
          <FileText className="size-4 shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1 truncate font-medium">
            {record.title}
          </span>
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            {fields
              .slice(0, 2)
              .map(
                (field) =>
                  field.options?.find(
                    (option) => option.id === record.properties[field.id],
                  )?.label || propertyText(record.properties[field.id]),
              )
              .filter(Boolean)
              .join(" · ")}
          </span>
          <ArrowUpRight className="size-3 shrink-0" />
        </WorkspaceButton>
      ))}
    </div>
  );
}
export function DatabaseGallery({ records, fields, onOpen }: RecordViewProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-4">
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          onClick={() => onOpen(record.id)}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all duration-200 hover:border-blue-300 active:scale-95 dark:border-lms-border dark:bg-lms-card dark:hover:border-cyan-500/40"
        >
          <div className="flex h-24 items-center justify-center bg-slate-50 dark:bg-lms-input">
            {record.icon ? (
              <span className="text-3xl">{record.icon}</span>
            ) : (
              <FileText className="size-7 text-slate-400" />
            )}
          </div>
          <div className="space-y-3 p-4">
            <h3 className="font-semibold">{record.title}</h3>
            {fields.slice(0, 3).map((field) => (
              <p
                key={field.id}
                className="flex justify-between gap-3 text-xs text-slate-500 dark:text-slate-400"
              >
                <span>{field.name}</span>
                <span className="truncate">
                  {field.options?.find(
                    (option) => option.id === record.properties[field.id],
                  )?.label ||
                    propertyText(
                      record.computed?.[field.id] ??
                        record.properties[field.id],
                    ) ||
                    "—"}
                </span>
              </p>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
