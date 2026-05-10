"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, Eye, Edit, Trash2 } from "lucide-react";
import { Announcement, STATUS_COLORS } from "@/types";
import SafeImage from "@/components/common/SafeImage";

interface AnnouncementCardProps {
  announcement: Announcement;
  isAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AnnouncementCard({
  announcement,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900
                    rounded-2xl border border-slate-200 dark:border-slate-800
                    shadow-sm hover:shadow-md hover:-translate-y-0.5
                    transition-all duration-300 overflow-hidden group flex flex-col">
      {/* Thumbnail */}
      <div className="relative w-full h-44 flex-shrink-0 overflow-hidden
                      bg-slate-100 dark:bg-slate-800">
        {announcement.images?.[0] ? (
          <SafeImage
            src={announcement.images[0]}
            alt={announcement.title}
            fill
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold
                          ${STATUS_COLORS[announcement.status]}`}>
          {announcement.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-2
                       group-hover:text-blue-600 dark:group-hover:text-blue-400
                       transition-colors duration-200">
          {announcement.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1">
          {announcement.content}
        </p>

        {/* Actions */}
        <div className="flex gap-1.5 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            size="sm"
            variant="ghost"
            onClick={onView}
            className="flex-1 h-8 text-slate-600 dark:text-slate-400
                       hover:text-blue-600 dark:hover:text-blue-400
                       hover:bg-blue-50 dark:hover:bg-blue-950/40
                       rounded-lg text-xs font-medium transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Xem
          </Button>
          {isAdmin && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                aria-label="Chỉnh sửa"
                className="h-8 w-8 p-0 text-slate-400 dark:text-slate-500
                           hover:text-blue-600 dark:hover:text-blue-400
                           hover:bg-blue-50 dark:hover:bg-blue-950/40
                           rounded-lg transition-all duration-200"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                aria-label="Xóa"
                className="h-8 w-8 p-0 text-slate-400 dark:text-slate-500
                           hover:text-red-600 dark:hover:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-950/40
                           rounded-lg transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}