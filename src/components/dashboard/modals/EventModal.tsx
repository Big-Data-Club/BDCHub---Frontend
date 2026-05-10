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
import { Badge } from "@/components/ui/badge";
import { Clock, ListTodo, ExternalLink, Users } from "lucide-react";
import { EventItem, ModalMode, EVENT_STATUSES, STATUS_COLORS, PRIORITY_COLORS } from "@/types";
import { INPUT_BASE, LABEL_BASE, SECTION_LABEL } from "./modalStyles";

interface EventModalProps {
  open: boolean;
  mode: ModalMode;
  event: Partial<EventItem>;
  onOpenChange: (open: boolean) => void;
  onChange: (event: Partial<EventItem>) => void;
  onSave: () => void;
}

const TITLE_MAP = {
  add: "Tạo sự kiện mới",
  edit: "Chỉnh sửa sự kiện",
  view: "Chi tiết sự kiện",
};

function ReadonlyField({ icon: Icon, value }: { icon: React.ElementType; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl p-3 text-sm
                    bg-slate-50 dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    text-slate-600 dark:text-slate-300">
      <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <span>{value}</span>
    </div>
  );
}

export function EventModal({ open, mode, event, onOpenChange, onChange, onSave }: EventModalProps) {
  const isViewMode = mode === "view";
  const formatDate = (d?: string) => d ? new Date(d).toLocaleString("vi-VN") : "Chưa xác định";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto
                                bg-white dark:bg-slate-900
                                border border-slate-200 dark:border-slate-800
                                shadow-xl rounded-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Sự kiện
          </p>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {TITLE_MAP[mode]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Basic info */}
          <section className="space-y-4">
            <p className={SECTION_LABEL}>Thông tin sự kiện</p>

            <div className="space-y-1.5">
              <Label className={LABEL_BASE}>Tên sự kiện</Label>
              <input
                value={event.title || ""}
                onChange={(e) => onChange({ ...event, title: e.target.value })}
                disabled={isViewMode}
                placeholder="Nhập tên sự kiện..."
                className={INPUT_BASE}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={LABEL_BASE}>Mô tả</Label>
              <textarea
                value={event.description || ""}
                onChange={(e) => onChange({ ...event, description: e.target.value })}
                disabled={isViewMode}
                placeholder="Mô tả chi tiết về sự kiện..."
                rows={3}
                className={`${INPUT_BASE} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={LABEL_BASE}>Ngày bắt đầu</Label>
                {!isViewMode
                  ? <input type="datetime-local" value={event.startTime || ""}
                           onChange={(e) => onChange({ ...event, startTime: e.target.value })}
                           className={INPUT_BASE} />
                  : <ReadonlyField icon={Clock} value={formatDate(event.startTime)} />
                }
              </div>
              <div className="space-y-1.5">
                <Label className={LABEL_BASE}>Ngày kết thúc</Label>
                {!isViewMode
                  ? <input type="datetime-local" value={event.endTime || ""}
                           onChange={(e) => onChange({ ...event, endTime: e.target.value })}
                           className={INPUT_BASE} />
                  : <ReadonlyField icon={Clock} value={formatDate(event.endTime)} />
                }
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={LABEL_BASE}>Số người tham gia</Label>
                {!isViewMode
                  ? <input type="number" value={event.capacity || ""}
                           onChange={(e) => onChange({ ...event, capacity: Number(e.target.value) })}
                           placeholder="Không giới hạn" min={0} className={INPUT_BASE} />
                  : <ReadonlyField icon={Users}
                                   value={event.capacity ? `${event.capacity} người` : "Không giới hạn"} />
                }
              </div>

              <div className="space-y-1.5">
                <Label className={LABEL_BASE}>Trạng thái</Label>
                {!isViewMode ? (
                  <Select
                    value={event.statusEvent || "PENDING"}
                    onValueChange={(v) => onChange({ ...event, statusEvent: v as any })}
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
                      {EVENT_STATUSES.map((status) => (
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
                                    ${STATUS_COLORS[event.statusEvent as keyof typeof STATUS_COLORS]}`}>
                    {event.statusEvent}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Tasks — view mode only */}
          {isViewMode && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className={`${SECTION_LABEL} flex items-center gap-1.5`}>
                  <ListTodo className="h-3.5 w-3.5" />
                  Tasks ({event.tasks?.length ?? 0})
                </p>
                {(event.tasks?.length ?? 0) > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/events/${event.id}/tasks`)}
                    className="border border-slate-300 dark:border-slate-700
                               text-slate-600 dark:text-slate-400
                               hover:bg-slate-50 dark:hover:bg-slate-800
                               rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Xem chi tiết
                  </Button>
                )}
              </div>

              {(event.tasks?.length ?? 0) > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {event.tasks!.map((task: any) => (
                    <div
                      key={task.id}
                      className="rounded-xl p-3.5
                                 bg-slate-50 dark:bg-slate-800
                                 border border-slate-200 dark:border-slate-700
                                 hover:border-blue-200 dark:hover:border-blue-800
                                 hover:bg-blue-50/30 dark:hover:bg-blue-950/20
                                 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100
                                       flex-1 pr-2">
                          {task.title}
                        </h4>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {task.priority && (
                            <Badge className={`${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
                                               || "bg-slate-100 text-slate-600"} text-xs border-0`}>
                              {task.priority}
                            </Badge>
                          )}
                          {task.columnId && (
                            <Badge variant="outline"
                                   className="text-xs text-slate-500 dark:text-slate-400
                                              border-slate-300 dark:border-slate-600">
                              {task.columnId}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400
                                      leading-relaxed line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}

                      {(task.startDate || task.endDate) && (
                        <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {task.startDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(task.startDate).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                          {task.endDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(task.endDate).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-xl
                                bg-slate-50 dark:bg-slate-800
                                border border-slate-200 dark:border-slate-700">
                  <ListTodo className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Chưa có task nào cho sự kiện này
                  </p>
                </div>
              )}
            </section>
          )}
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
              Lưu sự kiện
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}