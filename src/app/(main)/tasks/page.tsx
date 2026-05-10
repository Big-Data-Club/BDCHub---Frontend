"use client";

import React, { useState, useEffect } from "react";
import { Plus, Loader2, RefreshCw, LayoutDashboard, AlertCircle } from "lucide-react";
import TaskModal from "@/components/Board/Task/TaskModal";
import TaskScoreModal from "@/components/Board/Task/TaskScoreModal";
import BoardColumn from "@/components/Board/Column/BoardColumn";
import { Column, Task, User } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { userService } from "@/services/userService";
import { TaskRequest } from "@/services/taskService";

const inputClass =
  "w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 " +
  "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 " +
  "bg-slate-50 dark:bg-slate-800 " +
  "focus:bg-white dark:focus:bg-slate-900 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 " +
  "transition-all text-sm";

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "TODO", color: "bg-slate-500", tasks: [] },
    { id: "in-progress", title: "In Progress", color: "bg-blue-500", tasks: [] },
    { id: "done", title: "Done", color: "bg-green-500", tasks: [] },
    { id: "cancel", title: "Cancel", color: "bg-red-500", tasks: [] },
  ]);

  const [users, setUsers] = useState<User[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    task: Task | null;
    columnId: string | null;
  }>({ isOpen: false, task: null, columnId: null });
  const [scoreModalState, setScoreModalState] = useState<{
    isOpen: boolean;
    task: Task | null;
  }>({ isOpen: false, task: null });
  const [newColumnName, setNewColumnName] = useState("");
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [currentUserId] = useState<number>(1);

  const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, moveTask, deleteTask, fetchTasks } = useTasks();
  const { events, loading: eventsLoading } = useEvents();

  // Fetch users
  useEffect(() => {
    (async () => {
      try {
        const usersData = await userService.getAll();
        setUsers(
          usersData.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            code: u.code,
            team: u.team,
            type: u.type,
            role: u.role,
            score: u.totalScore,
            totalScore: u.totalScore,
            active: u.active,
            status: u.active,
            profilePicture: u.profilePicture,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    })();
  }, []);

  // Sync tasks → columns
  useEffect(() => {
    setColumns((prev) =>
      prev.map((col) => ({ ...col, tasks: tasks.filter((t) => t.columnId === col.id) }))
    );
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.columnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }
    try {
      await moveTask(Number(draggedTask.id), targetColumnId, currentUserId);
    } catch {
      alert("Failed to move task. Please try again.");
      await fetchTasks();
    } finally {
      setDraggedTask(null);
    }
  };

  const handleAddTask = (columnId: string) => setModalState({ isOpen: true, task: null, columnId });
  const handleEditTask = (task: Task) => setModalState({ isOpen: true, task, columnId: task.columnId });

  const handleSaveTask = async (taskData: any) => {
    const taskRequest: TaskRequest = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      columnId: taskData.columnId,
      startDate: taskData.startDate || undefined,
      endDate: taskData.endDate || undefined,
      eventId: taskData.eventId || undefined,
      assigneeIds: taskData.assignees.map((id: any) => Number(id)),
      links: taskData.links.map((link: any) => ({ url: link.url, title: link.title })),
    };

    if (modalState.task) {
      await updateTask(Number(modalState.task.id), taskRequest, currentUserId);
    } else {
      await createTask(taskRequest, currentUserId);
    }
    setModalState({ isOpen: false, task: null, columnId: null });
  };

  const handleDeleteTask = async (taskId: number | string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(Number(taskId));
    } catch {
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const colors = ["bg-purple-500", "bg-pink-500", "bg-yellow-500", "bg-indigo-500", "bg-teal-500"];
    setColumns([
      ...columns,
      {
        id: newColumnName.toLowerCase().replace(/\s+/g, "-"),
        title: newColumnName,
        color: colors[Math.floor(Math.random() * colors.length)],
        tasks: [],
      },
    ]);
    setNewColumnName("");
    setShowNewColumn(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (column?.tasks.length && !confirm(`This column has ${column.tasks.length} task(s). Delete it?`)) return;
    setColumns(columns.filter((col) => col.id !== columnId));
  };

  if (tasksLoading || eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading board...</p>
        </div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-2">Error Loading Board</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">{tasksError}</p>
          <button
            onClick={fetchTasks}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2.5 transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8" id="tasks-page">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between" id="tasks-header">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
                BDC Board
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} · {events.length} event{events.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400
                       hover:text-slate-800 dark:hover:text-slate-100
                       hover:bg-slate-100 dark:hover:bg-slate-800
                       border border-slate-200 dark:border-slate-700
                       rounded-xl px-4 py-2.5 transition-all active:scale-95"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Board */}
        <div className="flex gap-4 overflow-x-auto pb-4" id="tasks-columns">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              users={users}
              events={events}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onDeleteColumn={handleDeleteColumn}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onOpenScore={(task) => setScoreModalState({ isOpen: true, task })}
            />
          ))}

          {/* Add column */}
          {!showNewColumn ? (
            <button
              onClick={() => setShowNewColumn(true)}
              className="min-w-[300px] h-[180px] bg-white dark:bg-slate-900 border-2 border-dashed
                         border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center
                         hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800
                         transition-all group"
            >
              <div className="text-center">
                <Plus size={28} className="mx-auto text-slate-300 dark:text-slate-600 group-hover:text-blue-500 mb-2 transition-colors" />
                <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 text-sm font-medium transition-colors">
                  Add Column
                </span>
              </div>
            </button>
          ) : (
            <div className="min-w-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                className={inputClass}
                placeholder="Column name..."
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddColumn}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2 transition-all active:scale-95 text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowNewColumn(false); setNewColumnName(""); }}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700
                             text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800
                             rounded-xl py-2 font-medium transition-all active:scale-95 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {modalState.isOpen && (
        <TaskModal
          task={modalState.task}
          columnId={modalState.columnId}
          users={users}
          events={events}
          onSave={handleSaveTask}
          onClose={() => setModalState({ isOpen: false, task: null, columnId: null })}
        />
      )}

      {/* Score Modal */}
      {scoreModalState.isOpen && scoreModalState.task && (
        <TaskScoreModal
          task={scoreModalState.task}
          users={users}
          isOpen={scoreModalState.isOpen}
          onClose={() => setScoreModalState({ isOpen: false, task: null })}
          currentUserId={currentUserId}
          onScoresUpdated={fetchTasks}
        />
      )}
    </div>
  );
};

export default KanbanBoard;