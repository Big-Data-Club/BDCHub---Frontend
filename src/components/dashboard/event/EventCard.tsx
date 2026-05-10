"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Eye, Edit, Trash2 } from "lucide-react";
import { EventItem, STATUS_COLORS } from "@/types";
import { getCountdown } from "@/utils/dateUtils";

interface EventCardProps {
  event: EventItem;
  isAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventCard({ event, isAdmin, onView, onEdit, onDelete }: EventCardProps) {
  const countdown = getCountdown(event.startTime, event.endTime);

  const formattedDate = event.startTime
    ? new Date(event.startTime).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Chưa xác định";

  return (
    <div className="bg-white dark:bg-slate-900
                    rounded-2xl border border-slate-200 dark:border-slate-800
                    shadow-sm hover:shadow-md hover:-translate-y-0.5
                    transition-all duration-300 overflow-hidden group flex flex-col">
      {/* Thumbnail */}
      <div className="relative w-full h-44 flex-shrink-0
                      bg-slate-100 dark:bg-slate-800
                      flex items-center justify-center overflow-hidden">
        <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-600
                             group-hover:scale-110 transition-transform duration-500" />

        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold
                          ${STATUS_COLORS[event.statusEvent]}`}>
          {event.statusEvent}
        </span>

        <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg
                        flex items-center gap-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
          <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{formattedDate}</span>
        </div>

        {event.capacity && (
          <div className="absolute bottom-3 right-3 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg
                          flex items-center gap-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
            <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{event.capacity}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-2
                       group-hover:text-blue-600 dark:group-hover:text-blue-400
                       transition-colors duration-200">
          {event.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1">
          {event.description}
        </p>

        {countdown && (
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2
                        bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg w-fit">
            {countdown}
          </p>
        )}

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