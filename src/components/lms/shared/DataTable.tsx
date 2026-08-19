"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode | ((info: { sortBy?: string; sortDir?: "asc" | "desc" }) => React.ReactNode);
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortKey?: string;
  className?: string;
  headerClassName?: string;
  cell: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  loading?: boolean;
  emptyState?: React.ReactNode;
  caption?: React.ReactNode;
  footer?: React.ReactNode;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (sortKey: string) => void;
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  tableClassName?: string;
  wrapperClassName?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyState,
  caption,
  footer,
  onRowClick,
  rowClassName,
  sortBy,
  sortDir,
  onSort,
  renderMobileCard,
  tableClassName,
  wrapperClassName,
}: DataTableProps<T>) {
  const hasColGroup = columns.some((col) => col.width || col.minWidth);

  return (
    <div className={cn("w-full space-y-4", wrapperClassName)}>
      {/* Desktop Table View */}
      <div className={cn("hidden md:block overflow-x-auto", renderMobileCard ? "" : "block")}>
        <Table className={cn("w-full text-left border-collapse", hasColGroup && "table-fixed", tableClassName)}>
          {hasColGroup && (
            <colgroup>
              {columns.map((col) => (
                <col
                  key={col.key}
                  style={{
                    width: col.width,
                    minWidth: col.minWidth,
                  }}
                />
              ))}
            </colgroup>
          )}

          <TableHeader>
            <TableRow className="border-b border-slate-200/80 dark:border-blue-500/10 text-xs font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider bg-slate-50/50 dark:bg-[#070e1c]/40 select-none hover:bg-transparent">
              {columns.map((col) => {
                const targetSortKey = col.sortKey || col.key;
                const isSorted = sortBy === targetSortKey;
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left";

                return (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "px-6 py-4 h-auto font-bold",
                      alignClass,
                      col.sortable && "cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-cyan-400 group/th",
                      isSorted && "text-blue-600 dark:text-cyan-400",
                      col.headerClassName
                    )}
                    onClick={() => {
                      if (col.sortable && onSort) {
                        onSort(targetSortKey);
                      }
                    }}
                  >
                    {typeof col.header === "function"
                      ? col.header({ sortBy, sortDir })
                      : col.header}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100 dark:divide-blue-500/5">
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                  {emptyState ?? (
                    <span className="text-sm font-medium">Không có dữ liệu</span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor(item, index);
                const customRowClass =
                  typeof rowClassName === "function"
                    ? rowClassName(item, index)
                    : rowClassName;

                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "group hover:bg-slate-50/60 dark:hover:bg-[#0D192E]/40 transition-all duration-200 border-b border-slate-100 dark:border-blue-500/5",
                      onRowClick && "cursor-pointer",
                      customRowClass
                    )}
                    onClick={onRowClick ? () => onRowClick(item, index) : undefined}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";

                      return (
                        <TableCell
                          key={col.key}
                          className={cn("px-6 py-4", alignClass, col.className)}
                        >
                          {col.cell(item, index)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>

          {footer && <TableFooter>{footer}</TableFooter>}
          {caption && <TableCaption>{caption}</TableCaption>}
        </Table>
      </div>

      {/* Mobile Responsive Card List View */}
      {renderMobileCard && (
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-blue-500/5">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {emptyState ?? <span className="text-sm font-medium">Không có dữ liệu</span>}
            </div>
          ) : (
            data.map((item, index) => (
              <React.Fragment key={keyExtractor(item, index)}>
                {renderMobileCard(item, index)}
              </React.Fragment>
            ))
          )}
        </div>
      )}
    </div>
  );
}
