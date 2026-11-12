"use client";
import {
  AppWindow,
  ArrowUpRight,
  Copy,
  FileText,
  Link2,
  MoreHorizontal,
  Move,
  Palette,
  PanelRight,
  Share2,
  SquarePen,
  Star,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkspacePage } from "../types";
export type PageAction =
  | "rename"
  | "appearance"
  | "move"
  | "duplicate"
  | "archive"
  | "share"
  | "peek"
  | "favorite"
  | "link"
  | "export"
  | "import";
export function WorkspacePageMenu({
  page,
  editable,
  manager,
  onAction,
}: {
  page: WorkspacePage;
  editable: boolean;
  manager: boolean;
  onAction: (action: PageAction, page: WorkspacePage) => void;
}) {
  const url = `/workspace?page=${page.id}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Thao tác trang ${page.title}`}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 active:scale-95 dark:hover:bg-lms-hover"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[75dvh] min-w-56 overflow-y-auto rounded-xl"
      >
        {editable && (
          <>
            <DropdownMenuItem onClick={() => onAction("rename", page)}>
              <SquarePen className="mr-2 size-4" />
              Đổi tên
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("appearance", page)}>
              <Palette className="mr-2 size-4" />
              Icon & cover
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => onAction("favorite", page)}>
          <Star className="mr-2 size-4" />
          {page.favorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        >
          <ArrowUpRight className="mr-2 size-4" />
          Mở trong tab mới
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            window.open(
              url,
              "_blank",
              "noopener,noreferrer,popup,width=1100,height=800",
            )
          }
        >
          <AppWindow className="mr-2 size-4" />
          Mở trong cửa sổ mới
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("peek", page)}>
          <PanelRight className="mr-2 size-4" />
          Xem bên cạnh
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("link", page)}>
          <Link2 className="mr-2 size-4" />
          Sao chép liên kết
        </DropdownMenuItem>
        {editable && (
          <DropdownMenuItem onClick={() => onAction("duplicate", page)}>
            <Copy className="mr-2 size-4" />
            Nhân bản nội dung trang
          </DropdownMenuItem>
        )}
        {manager && page.kind !== "record" && (
          <DropdownMenuItem onClick={() => onAction("move", page)}>
            <Move className="mr-2 size-4" />
            Di chuyển đến
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onAction("share", page)}>
          <Share2 className="mr-2 size-4" />
          Chia sẻ & quyền truy cập
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("export", page)}>
          <FileText className="mr-2 size-4" />
          Xuất trang đang mở
        </DropdownMenuItem>
        {editable && (
          <DropdownMenuItem onClick={() => onAction("import", page)}>
            <FileText className="mr-2 size-4" />
            Thêm nội dung từ tệp
          </DropdownMenuItem>
        )}
        {manager && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction("archive", page)}
              className="text-rose-600 dark:text-rose-300"
            >
              <Trash2 className="mr-2 size-4" />
              Đưa vào thùng rác
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
