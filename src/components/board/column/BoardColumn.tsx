"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import TaskCard from "@/components/Board/Task/TaskCard";
import { Column, User, EventItem, Task } from "@/types";

interface BoardColumnProps {
  column: Column;
  users: User[];
  events: EventItem[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number | string) => void;
  onDeleteColumn: (columnId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onOpenScore?: (task: Task) => void;
}

const DEFAULT_COLUMNS = new Set(["todo", "in-progress", "done", "cancel"]);

const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  users,
  events,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onDragStart,
  onDrop,
  onDragOver,
  onOpenScore,
}) => {
  const isDefault = DEFAULT_COLUMNS.has(column.id.toLowerCase());

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
      className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800
                 p-4 min-w-[300px] max-w-[300px] flex flex-col"
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {column.title}
          </h3>
          <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
            {column.tasks.length}
          </span>
        </div>
        {!isDefault && (
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete column"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto mb-3 min-h-[160px] space-y-0">
        {column.tasks.length > 0 ? (
          column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              events={events}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
              onOpenScore={onOpenScore}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 dark:text-slate-600 text-xs">No tasks yet</p>
          </div>
        )}
      </div>

      {/* Add task */}
      <button
        onClick={() => onAddTask(column.id)}
        className="flex items-center justify-center gap-1.5 w-full py-2 text-slate-500 dark:text-slate-400
                   hover:text-slate-800 dark:hover:text-slate-100
                   hover:bg-slate-200 dark:hover:bg-slate-800
                   rounded-xl transition-all text-sm font-medium"
      >
        <Plus size={15} />
        Add Task
      </button>
    </div>
  );
};

export default BoardColumn;