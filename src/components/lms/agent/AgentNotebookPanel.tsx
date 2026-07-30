"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, BookOpen, Search, Calendar, Loader2, Plus, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { agentService } from "@/services/agentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedNote, setSelectedNote] = useState<NotebookNote | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await agentService.listNotebook(courseId);
      setNotes(data || []);
    } catch (err) {
      console.error("Failed to load notebook entries:", err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchNotes();
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
    } catch (err) {
      console.error("Failed to delete notebook entry:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const createNote = async () => {
    const title = draftTitle.trim();
    const content = draftContent.trim();
    if (!title || !content || saving) return;
    setSaving(true);
    try {
      const created = await agentService.saveNotebookEntry({ title, content, courseId });
      setNotes((current) => [created, ...current]);
      setDraftTitle("");
      setDraftContent("");
      setCreateOpen(false);
      setSelectedNote(created);
    } catch (err) {
      console.error("Failed to save notebook entry", err);
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
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notebook</h3>
            <p className="text-[11px] text-slate-400">Lưu ý tưởng, câu trả lời AI và nội dung ôn tập</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm" className="h-8 rounded-lg bg-blue-600 px-3 text-xs hover:bg-blue-700">
            <Plus className="mr-1 h-3.5 w-3.5" />Ghi chú
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm ghi chú..."
            className="pl-9 bg-slate-50 dark:bg-slate-850 rounded-xl focus-visible:ring-blue-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="h-[calc(100vh-130px)] p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500">Đang tải ghi chú của bạn...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-350 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Không có ghi chú nào</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-[280px] mx-auto">
              {searchQuery ? "Không tìm thấy kết quả phù hợp." : "Hãy bảo Agent lưu ghi chú, tóm tắt bài học để lưu tại đây."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-12">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="group cursor-pointer rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.99] border hover:border-blue-500/30"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {note.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
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
                    </Button>
                  </div>
                  <CardDescription className="flex items-center text-[10px] text-slate-400 gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(note.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {note.content.replace(/[#*`_-]/g, "")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Note Detail Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {selectedNote && (
            <>
              <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {selectedNote.title}
                </DialogTitle>
                <DialogDescription className="flex items-center text-xs text-slate-400 gap-1.5 mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Ghi vào {formatDate(selectedNote.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh] pr-2">
                <div className="prose prose-slate dark:prose-invert prose-xs leading-relaxed max-w-none text-slate-600 dark:text-slate-350 pr-4">
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              </ScrollArea>
              
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <Button
                  onClick={() => setSelectedNote(null)}
                  className="rounded-xl px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm active:scale-95 transition-all duration-200"
                >
                  Đóng
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl rounded-2xl bg-white p-6 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Tạo ghi chú</DialogTitle>
            <DialogDescription>Ghi nhanh điều bạn muốn nhớ. Có thể dùng Markdown đơn giản.</DialogDescription>
          </DialogHeader>
          <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Tiêu đề ghi chú" maxLength={180} />
          <textarea value={draftContent} onChange={(event) => setDraftContent(event.target.value)} placeholder="Nội dung cần lưu…" className="min-h-52 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" maxLength={100000} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button onClick={createNote} disabled={!draftTitle.trim() || !draftContent.trim() || saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}Lưu ghi chú
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
