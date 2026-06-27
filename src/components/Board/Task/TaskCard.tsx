"use client";

import React, { useState } from "react";
import {
  Calendar,
  ExternalLink,
  User,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
  Award,
} from "lucide-react";
import { Task, User as UserType, EventItem, PRIORITY_COLORS } from "@/types";
import { formatDate } from "@/utils/utils";
import { useAuth } from "@/hooks/useAuth";
import SafeImage from "@/components/common/SafeImage";

interface TaskCardProps {
  task: Task;
  users: UserType[];
  events: EventItem[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number | string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onOpenScore?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  users,
  events,
  onEdit,
  onDelete,
  onDragStart,
  onOpenScore,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { canEditTask } = useAuth();

  const assignedUsers = users.filter((u) =>
    task.assignees.some((id) => id.toString() === u.id.toString())
  );
  const associatedEvent =
    task.event ?? events.find((e) => e.id.toString() === task.eventId?.toString());

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800
                 p-4 shadow-sm hover:shadow-md transition-shadow cursor-move mb-3 relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex-1 pr-2 leading-snug">
          {task.title}
        </h4>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <MoreVertical size={15} />
        </button>

        {/* Dropdown */}
        {showMenu && (
          <div className="absolute right-2 top-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl z-10 py-1 min-w-[140px]">
            {canEditTask && (
              <button
                onClick={() => { onEdit(task); setShowMenu(false); }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm w-full text-left text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Edit2 size={13} /> Edit
              </button>
            )}
            {onOpenScore && (
              <button
                onClick={() => { onOpenScore(task); setShowMenu(false); }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm w-full text-left text-blue-600 dark:text-blue-400 transition-colors"
              >
                <Award size={13} /> Manage Scores
              </button>
            )}
            <button
              onClick={() => { onDelete(task.id); setShowMenu(false); }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm w-full text-left text-red-500 dark:text-red-400 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Priority badge */}
      {task.priority && (
        <div className="mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg border ${PRIORITY_COLORS[task.priority]}`}
          >
            <AlertCircle size={11} />
            {task.priority}
          </span>
        </div>
      )}

      {/* Event badge */}
      {associatedEvent && (
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-lg">
            {associatedEvent.title}
          </span>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 line-clamp-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Assignees */}
      {assignedUsers.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <User size={12} className="text-slate-400 dark:text-slate-600" />
          <div className="flex -space-x-1.5">
            {assignedUsers.map((user) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-slate-900 overflow-hidden"
                title={`${user.name} (${user.team})`}
              >
                <SafeImage
                  src={
                    user.profilePicture ||
                    `https://api.dicebear.com/9.x/adventurer/png?seed=${user.name}`
                  }
                  alt={user.name}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {task.links && task.links.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2 py-0.5 rounded-lg transition-colors"
            >
              <ExternalLink size={10} />
              {link.title}
            </a>
          ))}
        </div>
      )}

      {/* Dates */}
      {(task.startDate || task.endDate) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-600 mb-1">
          <Calendar size={11} />
          <span>
            {formatDate(task.startDate)}
            {task.startDate && task.endDate && " → "}
            {formatDate(task.endDate)}
          </span>
        </div>
      )}

      {/* Created/Updated */}
      {(task.createdBy || task.updatedBy) && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600 space-y-0.5">
          {task.createdBy && (
            <div>
              Created by <span className="font-medium text-slate-500 dark:text-slate-500">{task.createdBy.name}</span>
            </div>
          )}
          {task.updatedBy && (
            <div>
              Updated by <span className="font-medium text-slate-500 dark:text-slate-500">{task.updatedBy.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;