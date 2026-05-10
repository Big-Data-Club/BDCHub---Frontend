"use client";

import React from "react";
import { EventCard } from "./EventCard";
import { LoadingState } from "../LoadingState";
import { EventItem } from "@/types";

interface EventListProps {
  events: EventItem[];
  loading: boolean;
  isAdmin: boolean;
  onView: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onDelete: (id: number) => void;
}

export function EventList({ events, loading, isAdmin, onView, onEdit, onDelete }: EventListProps) {
  if (loading) return <LoadingState message="Đang tải sự kiện..." />;

  if (events.length === 0) {
    return (
      <div className="col-span-4 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có sự kiện nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isAdmin={isAdmin}
          onView={() => onView(event)}
          onEdit={() => onEdit(event)}
          onDelete={() => {
            if (confirm("Bạn có chắc muốn xóa sự kiện này?")) {
              onDelete(event.id);
            }
          }}
        />
      ))}
    </div>
  );
}