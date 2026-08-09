"use client";
import { useRef, useState } from "react";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import { getAccessToken } from "@/services/authToken";
import { materialRoutingService, type MaterialRoutingJob, type RoutingDocument } from "@/services/materialRoutingService";
import type { Section } from "@/types";

export default function CourseMaterialRoutingModal({ courseId, sections, onClose, onSuccess }: { courseId: number; sections: Section[]; onClose: () => void; onSuccess: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [job, setJob] = useState<MaterialRoutingJob | null>(null);
  const [assignments, setAssignments] = useState<Record<string, number | null>>({});
  const [busy, setBusy] = useState<"upload" | "analyse" | "apply" | null>(null);
  const [error, setError] = useState("");

  const analyse = async () => {
    if (!files.length || !sections.length) return;
    setError(""); setBusy("upload");
    try {
      const form = new FormData(); form.append("type", "document"); files.forEach(file => form.append("file", file));
      const token = await getAccessToken();
      const response = await fetch("/lmsapiv1/files/upload", { method: "POST", body: form, credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload?.error?.message || payload?.message || `Upload lỗi ${response.status}`);
      const raw = payload.data?.files ?? [payload.data];
      const documents: RoutingDocument[] = raw.map((item: any, index: number) => ({ id: String(item.file_id), filename: item.file_name, file_path: item.file_path, content_type: files[index]?.type || "application/octet-stream" }));
      setBusy("analyse"); let current = await materialRoutingService.create(courseId, documents); setJob(current);
      const deadline = Date.now() + 20 * 60_000;
      while (current.status === "PROCESSING" && Date.now() < deadline) { await new Promise(resolve => setTimeout(resolve, 2000)); current = await materialRoutingService.get(courseId, current.id); setJob(current); }
      if (current.status === "FAILED") throw new Error(current.error_message || "AI không thể phân loại tài liệu");
      if (current.status !== "READY") throw new Error("Phân loại quá thời gian chờ; có thể xem lại sau.");
      setAssignments(Object.fromEntries(current.documents.map(doc => [doc.id, current.suggestions.find(item => item.document_id === doc.id)?.section_id ?? null])));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể phân loại tài liệu"); }
    finally { setBusy(null); }
  };

  const apply = async () => {
    if (!job) return; const missing = job.documents.some(doc => !assignments[doc.id]); if (missing) { setError("Hãy chọn chương cho tất cả tài liệu."); return; }
    setBusy("apply"); setError("");
    try { await materialRoutingService.apply(courseId, job.id, job.documents.map(doc => ({ document_id: doc.id, section_id: assignments[doc.id]!, title: doc.filename.replace(/\.[^.]+$/, ""), description: "", is_mandatory: false }))); onSuccess(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể thêm tài liệu"); } finally { setBusy(null); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
    <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Upload tài liệu chung</h2><p className="mt-1 text-sm text-slate-500">AI đề xuất chương; bạn có thể đổi trước khi xác nhận.</p></div><button onClick={onClose} disabled={!!busy}><X /></button></div>
    {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {!job && <><input ref={input} type="file" multiple className="hidden" onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}/><button onClick={() => input.current?.click()} className="mt-5 flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 text-violet-700"><Upload/><span className="mt-2 font-semibold">Chọn nhiều file, mọi định dạng</span></button><div className="mt-3 space-y-2">{files.map((file, i) => <div key={`${file.name}-${i}`} className="flex justify-between rounded-lg border p-2 text-sm"><span className="truncate">{file.name}</span><button onClick={() => setFiles(items => items.filter((_, x) => x !== i))}><X className="h-4 w-4"/></button></div>)}</div></>}
    {job?.status === "PROCESSING" && <div className="flex min-h-48 items-center justify-center gap-2"><Loader2 className="animate-spin"/> AI đang đọc và phân loại tài liệu…</div>}
    {job?.status === "READY" && <div className="mt-5 space-y-3">{job.documents.map(doc => { const suggestion = job.suggestions.find(item => item.document_id === doc.id); return <div key={doc.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_260px]"><div><div className="font-semibold">{doc.filename}</div><div className="mt-1 text-xs text-slate-500">{suggestion?.rationale || "Chọn chương phù hợp"}{suggestion && !suggestion.requires_manual_selection ? ` · ${Math.round(suggestion.confidence * 100)}%` : ""}</div></div><select value={assignments[doc.id] ?? ""} onChange={e => setAssignments(prev => ({...prev, [doc.id]: e.target.value ? Number(e.target.value) : null}))} className="rounded-lg border bg-transparent px-3 py-2"><option value="">Chọn chương…</option>{sections.map(section => <option key={section.id} value={section.id}>{section.title}</option>)}</select></div>})}</div>}
    <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={!!busy} className="rounded-lg border px-4 py-2">Hủy</button>{!job && <button onClick={analyse} disabled={!files.length || !!busy} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}Phân loại bằng AI</button>}{job?.status === "READY" && <button onClick={apply} disabled={!!busy} className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white">{busy === "apply" ? "Đang thêm…" : "Xác nhận & thêm vào chương"}</button>}</div>
  </div></div>;
}
