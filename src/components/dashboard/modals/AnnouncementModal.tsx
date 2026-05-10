"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Announcement, ModalMode, ANNOUNCEMENT_STATUSES, STATUS_COLORS } from "@/types";
import { INPUT_BASE, LABEL_BASE } from "./modalStyles";

interface AnnouncementModalProps {
  open: boolean;
  mode: ModalMode;
  announcement: Partial<Announcement>;
  onOpenChange: (open: boolean) => void;
  onChange: (announcement: Partial<Announcement>) => void;
  onSave: () => void;
}

const TITLE_MAP = {
  add: "Tạo thông báo mới",
  edit: "Chỉnh sửa thông báo",
  view: "Chi tiết thông báo",
};

export function AnnouncementModal({
  open,
  mode,
  announcement,
  onOpenChange,
  onChange,
  onSave,
}: AnnouncementModalProps) {
  const isViewMode = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl
                                bg-white dark:bg-slate-900
                                border border-slate-200 dark:border-slate-800
                                shadow-xl rounded-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Thông báo
          </p>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {TITLE_MAP[mode]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className={LABEL_BASE}>Tiêu đề</Label>
            <input
              value={announcement.title || ""}
              onChange={(e) => onChange({ ...announcement, title: e.target.value })}
              disabled={isViewMode}
              placeholder="Nhập tiêu đề thông báo..."
              className={INPUT_BASE}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={LABEL_BASE}>Nội dung</Label>
            <textarea
              value={announcement.content || ""}
              onChange={(e) => onChange({ ...announcement, content: e.target.value })}
              disabled={isViewMode}
              placeholder="Nhập nội dung chi tiết..."
              rows={4}
              className={`${INPUT_BASE} resize-none`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={LABEL_BASE}>
              Hình ảnh URL
              <span className="text-slate-400 dark:text-slate-600 font-normal ml-1">
                (phân cách bởi dấu phẩy)
              </span>
            </Label>
            <input
              value={(announcement.images || []).join(", ")}
              onChange={(e) =>
                onChange({
                  ...announcement,
                  images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              disabled={isViewMode}
              placeholder="https://example.com/image.jpg"
              className={INPUT_BASE}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={LABEL_BASE}>Trạng thái</Label>
            {!isViewMode ? (
              <Select
                value={announcement.status || "PENDING"}
                onValueChange={(v) => onChange({ ...announcement, status: v as any })}
              >
                <SelectTrigger className="rounded-xl
                                          border border-slate-300 dark:border-slate-700
                                          bg-slate-50 dark:bg-slate-800
                                          text-slate-900 dark:text-slate-100
                                          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900
                                          border border-slate-200 dark:border-slate-800 rounded-xl">
                  {ANNOUNCEMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}
                                className="focus:bg-slate-100 dark:focus:bg-slate-800">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium
                                        ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>
                        {status}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold
                                ${STATUS_COLORS[announcement.status as keyof typeof STATUS_COLORS]}`}>
                {announcement.status}
              </span>
            )}
          </div>
        </div>

        {!isViewMode && (
          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border border-slate-300 dark:border-slate-700
                         text-slate-700 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800
                         rounded-xl px-5 font-medium transition-all duration-200 active:scale-95"
            >
              Hủy
            </Button>
            <Button
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
                         px-6 rounded-xl shadow-sm transition-all duration-200 active:scale-95"
            >
              Lưu thông báo
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}