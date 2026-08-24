"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, BookOpen, Search, Calendar, Loader2, Plus, AlertTriangle } from "lucide-react";
import { agentService, notifyNotebookChanged } from "@/services/ai/agentService";
import { PrimaryBtn, GhostBtn } from "@/components/lms/shared/Button";
import { SearchBar } from "@/components/lms/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookNoteDialog } from "./NotebookNoteDialog";

interface AgentNotebookPanelProps {
  courseId?: number;
  className?: string;
}

interface NotebookNote {
  id: string;
  user_id: number;
  course_id?: number;
  node_id?: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function AgentNotebookPanel({ courseId, className }: AgentNotebookPanelProps) {
  const [notes, setNotes] = useState<NotebookNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NotebookNote | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // When opened inside a course, let the user switch between that course's
  // notes and everything they have ever saved (including global notes).
  const [scope, setScope] = useState<"course" | "all">("course");
  const effectiveCourseId = courseId && scope === "course" ? courseId : undefined;

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await agentService.listNotebook(effectiveCourseId);
      setNotes(data || []);
    } catch (err) {
      console.error("Failed to load notebook entries:", err);
      setLoadError("Không tải được ghi chú. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [effectiveCourseId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Stay in sync with saves made elsewhere (AI chat "Lưu ghi chú", widgets,
  // other panels) - without this the list silently goes stale.
  useEffect(() => {
    const handler = () => fetchNotes();
    window.addEventListener("bdc:notebook-changed", handler);
    return () => window.removeEventListener("bdc:notebook-changed", handler);
  }, [fetchNotes]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc chắn muốn xóa ghi chú này không?")) return;
    setDeletingId(id);
    try {
      await agentService.deleteNotebookEntry(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      notifyNotebookChanged();
    } catch (err) {
      console.error("Failed to delete notebook entry:", err);
    } finally {
      setDeletingId(null);
    }
  };
  const handleSaveNote = async (title: string, content: string) => {
    setSaving(true);
    try {
      const created = await agentService.saveNotebookEntry({ title, content, courseId });
      setNotes((current) => [created, ...current]);
      setSelectedNote(created);
      notifyNotebookChanged();
    } catch (err) {
      console.error("Failed to save notebook entry", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (title: string, content: string) => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      const updated = await agentService.updateNotebookEntry(selectedNote.id, { title, content });
      setNotes((current) =>
        current.map((n) => (n.id === selectedNote.id ? { ...n, title, content, updated_at: updated?.updated_at || n.updated_at } : n))
      );
      setSelectedNote((prev) => (prev ? { ...prev, title, content } : prev));
      notifyNotebookChanged();
    } catch (err) {
      console.error("Failed to update notebook entry", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={className}>
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070E1C] sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notebook</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Lưu ý tưởng, câu trả lời AI và nội dung ôn tập</p>
          </div>
          <PrimaryBtn onClick={() => setCreateOpen(true)} size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            Ghi chú
          </PrimaryBtn>
        </div>
        <SearchBar
          placeholder="Tìm kiếm ghi chú..."
          value={searchQuery}
          onChange={setSearchQuery}
          size="sm"
        />
        {courseId && (
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-[#0D192E] p-0.5 text-xs font-medium">
            <button
              onClick={() => setScope("course")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                scope === "course"
                  ? "bg-white dark:bg-[#1B2C4E] text-blue-600 dark:text-cyan-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              Khóa này
            </button>
            <button
              onClick={() => setScope("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                scope === "all"
                  ? "bg-white dark:bg-[#1B2C4E] text-blue-600 dark:text-cyan-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              Tất cả ghi chú
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <ScrollArea className="h-[calc(100vh-130px)] p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải ghi chú của bạn...</p>
          </div>
        ) : loadError ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Không tải được ghi chú</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-4">{loadError}</p>
            <PrimaryBtn size="sm" onClick={fetchNotes}>Thử lại</PrimaryBtn>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Không có ghi chú nào</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-[280px] mx-auto">
              {searchQuery ? "Không tìm thấy kết quả phù hợp." : "Hãy bảo Agent lưu ghi chú, tóm tắt bài học để lưu tại đây."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-12">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="group cursor-pointer rounded-2xl border-slate-200 dark:border-blue-500/10 bg-white dark:bg-[#0F1E35] shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.99] border hover:border-blue-500/25 dark:hover:border-blue-500/25"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {note.title}
                    </CardTitle>
                    <GhostBtn
                      size="icon"
                      disabled={deletingId === note.id}
                      onClick={(e) => handleDelete(note.id, e)}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                    >
                      {deletingId === note.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </GhostBtn>
                  </div>
                  <CardDescription className="flex items-center text-xs text-slate-400 dark:text-slate-500 gap-1 mt-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    {formatDate(note.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-350 line-clamp-3 leading-relaxed">
                    {note.content.replace(/[#*`_-]/g, "")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Notebook Note Dialog */}
      <NotebookNoteDialog
        isOpen={createOpen || !!selectedNote}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setSelectedNote(null);
          }
        }}
        mode={createOpen ? "create" : "view"}
        note={selectedNote || undefined}
        saving={saving}
        onSave={handleSaveNote}
        onUpdate={handleUpdateNote}
      />
    </div>
  );
}
