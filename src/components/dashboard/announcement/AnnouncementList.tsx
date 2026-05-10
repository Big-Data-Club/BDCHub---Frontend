"use client";

import React from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import { LoadingState } from "../LoadingState";
import { Announcement } from "@/types";

interface AnnouncementListProps {
  announcements: Announcement[];
  loading: boolean;
  isAdmin: boolean;
  onView: (announcement: Announcement) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: number) => void;
}

export function AnnouncementList({
  announcements,
  loading,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: AnnouncementListProps) {
  if (loading) return <LoadingState message="Đang tải thông báo..." />;

  if (announcements.length === 0) {
    return (
      <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có thông báo nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          isAdmin={isAdmin}
          onView={() => onView(announcement)}
          onEdit={() => onEdit(announcement)}
          onDelete={() => {
            if (confirm("Bạn có chắc muốn xóa thông báo này?")) {
              onDelete(announcement.id);
            }
          }}
        />
      ))}
    </div>
  );
}