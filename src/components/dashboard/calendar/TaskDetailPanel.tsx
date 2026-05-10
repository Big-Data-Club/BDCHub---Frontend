"use client";

import React from "react";
import { X, Clock, Users, Link2 } from "lucide-react";
import { TaskWithColor, PRIORITY_CONFIG, STATUS_CONFIG } from "@/types";
import { parseDate, formatDateTime } from "@/utils/calendar";

interface TaskDetailPanelProps {
  task: TaskWithColor;
  onClose: () => void;
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.MEDIUM;
  const status   = STATUS_CONFIG[task.status ?? "todo"];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col
                   bg-white dark:bg-slate-900
                   border-l border-slate-200 dark:border-slate-800
                   shadow-xl animate-slide-in"
        style={{ animationDuration: "220ms" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5
                        border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Task</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-snug">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md
                                ${status.dot.replace("bg-", "bg-").replace("500","50").replace("400","50")}
                                text-slate-700 dark:text-slate-200`}
                style={{ backgroundColor: "transparent", border: "1px solid currentColor", opacity: 0.9 }}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          {task.description && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed
                            bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                {task.description}
              </p>
            </section>
          )}

          {/* Event */}
          {(task.eventName || task.event?.title) && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">
                Event
              </h3>
              <div
                className="text-xs font-semibold px-3 py-2 rounded-xl text-white"
                style={{ backgroundColor: task.color }}
              >
                {task.eventName ?? task.event?.title}
              </div>
            </section>
          )}

          {/* Schedule */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock size={12} />
              Schedule
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1.5">
              <Row label="Start" value={formatDateTime(parseDate(task.startDate))} />
              <Row label="End"   value={formatDateTime(parseDate(task.endDate))}   />
            </div>
          </section>

          {/* Assignees */}
          {(task.assignees?.length ?? 0) > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users size={12} />
                Assignees ({task.assignees!.length})
              </h3>
              <div className="space-y-1.5">
                {task.assignees!.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl
                               bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700
                                     flex items-center justify-center text-xs font-semibold
                                     text-slate-600 dark:text-slate-300 flex-shrink-0">
                      {a.name?.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{a.name}</p>
                      <p className="text-xs text-slate-400 truncate">{a.team}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {(task.links?.length ?? 0) > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Link2 size={12} />
                Resources
              </h3>
              <div className="space-y-1.5">
                {task.links!.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                               bg-slate-50 dark:bg-slate-800
                               text-blue-600 dark:text-blue-400
                               hover:bg-blue-50 dark:hover:bg-blue-950/30
                               transition-colors duration-150"
                  >
                    <Link2 size={12} className="flex-shrink-0" />
                    <span className="truncate font-medium">{link.title}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in var(--duration, 220ms) ease-out both; }
      `}</style>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500 dark:text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}