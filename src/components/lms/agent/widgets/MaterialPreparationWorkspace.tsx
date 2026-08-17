"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import lmsService from "@/services/lmsService";
import { getAccessToken } from "@/services/authToken";

type MaterialType = "DOCUMENT" | "VIDEO" | "IMAGE";
type ItemStatus = "draft" | "uploading" | "done" | "error";

interface SectionOption { id: number; title: string; }
interface MaterialItem {
  id: string;
  file: File;
  title: string;
  description: string;
  type: MaterialType;
  category: string;
  sectionId: number | "";
  shouldIndex: boolean;
  status: ItemStatus;
  error?: string;
}

interface MaterialPreparationWorkspaceProps {
  props: { course_id: number; section_id?: number | null };
}

const DOCUMENT_EXTENSIONS = new Set(["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "md", "ipynb", "py", "cpp", "sql"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "avi", "mov", "mkv", "webm"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

function fileExtension(name: string) { return name.split(".").pop()?.toLowerCase() || ""; }
function cleanName(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Fast client-side proposal. It is deterministic, instant, and editable. */
function propose(file: File, sectionId: number | ""): MaterialItem {
  const raw = cleanName(file.name);
  const label = raw.toLowerCase();
  const type: MaterialType = VIDEO_EXTENSIONS.has(fileExtension(file.name)) ? "VIDEO" : IMAGE_EXTENSIONS.has(fileExtension(file.name)) ? "IMAGE" : "DOCUMENT";
  const isAnswer = /(đáp án|dap an|solution|answer|lời giải|loi giai)/i.test(label);
  const isExercise = /(bài tập|bai tap|exercise|assignment|homework)/i.test(label);
  const isSlide = /(slide|lecture|bài giảng|bai giang|presentation|ppt)/i.test(label);
  const isReference = /(tham khảo|tham khao|reference|reading|tài liệu)/i.test(label);
  const category = isAnswer ? "Đáp án / nội bộ" : isExercise ? "Bài tập" : isSlide ? "Bài giảng" : isReference ? "Tài liệu tham khảo" : "Tài liệu học";
  const prefix = isExercise ? "Bài tập" : isSlide ? "Bài giảng" : isReference ? "Tài liệu tham khảo" : "Tài liệu";
  return {
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    title: `${prefix}: ${raw}`.slice(0, 250),
    description: isAnswer ? "Tài liệu đáp án; mặc định không index để tránh lộ nội dung cho học viên." : `${category} cho khóa học. Vui lòng chỉnh sửa mô tả nếu cần.`,
    type,
    category,
    sectionId,
    shouldIndex: DOCUMENT_EXTENSIONS.has(fileExtension(file.name)) && !isAnswer,
    status: "draft",
  };
}

async function uploadFile(item: MaterialItem) {
  const form = new FormData();
  form.append("type", item.type === "VIDEO" ? "video" : item.type === "IMAGE" ? "image" : "document");
  form.append("file", item.file);
  const token = await getAccessToken();
  const response = await fetch("/lmsapiv1/files/upload", {
    method: "POST", body: form, credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `Upload thất bại (${response.status})`);
  const result = await response.json();
  if (!result.data?.file_path) throw new Error("Phản hồi upload không hợp lệ");
  return result.data;
}

export function MaterialPreparationWorkspace({ props }: MaterialPreparationWorkspaceProps) {
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultSectionId = useMemo(() => props.section_id || sections[0]?.id || "", [props.section_id, sections]);

  useEffect(() => {
    let cancelled = false;
    lmsService.listSections(props.course_id)
      .then((res) => { if (!cancelled) setSections(res?.data || []); })
      .catch(() => { if (!cancelled) setSections([]); })
      .finally(() => { if (!cancelled) setLoadingSections(false); });
    return () => { cancelled = true; };
  }, [props.course_id]);

  const update = (id: string, patch: Partial<MaterialItem>) => setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));
  const addFiles = (files: FileList | null) => {
    if (!files) return;
    setItems((prev) => [...prev, ...Array.from(files).map((file) => propose(file, defaultSectionId))]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const commit = async () => {
    const pending = items.filter((item) => item.status === "draft");
    if (!pending.length || isCommitting) return;
    if (pending.some((item) => !item.title.trim() || !item.sectionId)) return;
    setIsCommitting(true);
    const nextOrder = new Map<number, number>();
    await Promise.all([...new Set(pending.map((item) => Number(item.sectionId)))].map(async (sectionId) => {
      const res = await lmsService.listContent(sectionId);
      nextOrder.set(sectionId, (res?.data || []).length);
    }));

    // A small pool avoids browser/network saturation while remaining much
    // faster than one-file-at-a-time uploads.
    const queue = [...pending];
    const worker = async () => {
      while (queue.length) {
        const item = queue.shift();
        if (!item) return;
        update(item.id, { status: "uploading", error: undefined });
        try {
          const uploaded = await uploadFile(item);
          const sectionId = Number(item.sectionId);
          const orderIndex = nextOrder.get(sectionId) || 0;
          nextOrder.set(sectionId, orderIndex + 1);
          const created = await lmsService.createContent(sectionId, {
            type: item.type, title: item.title.trim(), description: item.description.trim(), order_index: orderIndex,
            metadata: { file_path: uploaded.file_path, file_name: uploaded.file_name || item.file.name, file_size: uploaded.file_size || item.file.size, file_type: item.file.type, material_category: item.category },
          });
          const contentId = created?.data?.id || created?.id;
          if (item.shouldIndex && contentId) await lmsService.triggerContentIndex(Number(contentId));
          update(item.id, { status: "done" });
        } catch (error: any) {
          update(item.id, { status: "error", error: error?.message || "Không thể thêm file" });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, pending.length) }, worker));
    setIsCommitting(false);
    setComplete(true);
  };

  const drafts = items.filter((item) => item.status === "draft");
  const indexed = drafts.filter((item) => item.shouldIndex).length;

  return (
    <div className="mt-3 w-full rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-900/70 dark:bg-slate-950">
      <div className="border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex gap-2.5"><div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"><Sparkles className="h-4 w-4" /></div><div><h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Chuẩn bị tài liệu với AI</h3><p className="mt-0.5 text-xs text-slate-500">Đề xuất nhanh theo tên file; bạn sửa được title, mô tả, chapter và lựa chọn index trước khi áp dụng.</p></div></div>
      </div>
      <div className="space-y-3 p-4">
        {loadingSections ? <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Đang tải chapters…</div> : sections.length === 0 ? <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">Khóa học chưa có chapter. Hãy tạo chapter trước khi thêm tài liệu.</p> : <>
          <input ref={inputRef} className="hidden" type="file" multiple onChange={(event) => addFiles(event.target.files)} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isCommitting} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-5 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300"><Upload className="h-4 w-4" />Thả/chọn nhiều file để AI chuẩn bị</button>
          {items.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <div className="mb-2 flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200"><FileText className="mr-1 inline h-3.5 w-3.5 text-blue-500" />{item.file.name}</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.category} · {(item.file.size / 1024 / 1024).toFixed(1)} MB</p></div><button type="button" disabled={isCommitting || item.status !== "draft"} onClick={() => setItems((prev) => prev.filter((candidate) => candidate.id !== item.id))} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button></div>
            <div className="grid gap-2 sm:grid-cols-2"><input value={item.title} disabled={item.status !== "draft"} onChange={(event) => update(item.id, { title: event.target.value })} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900" aria-label="Tiêu đề tài liệu" /><select value={item.sectionId} disabled={item.status !== "draft"} onChange={(event) => update(item.id, { sectionId: Number(event.target.value) })} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900">{sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select></div>
            <textarea value={item.description} disabled={item.status !== "draft"} onChange={(event) => update(item.id, { description: event.target.value })} className="mt-2 min-h-16 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900" aria-label="Mô tả tài liệu" />
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><input type="checkbox" checked={item.shouldIndex} disabled={item.status !== "draft"} onChange={(event) => update(item.id, { shouldIndex: event.target.checked })} />Index để AI có thể trả lời từ tài liệu này</label>
            {item.status === "uploading" && <p className="mt-2 text-xs text-blue-600"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" />Đang tải và tạo nội dung…</p>}{item.status === "done" && <p className="mt-2 text-xs text-emerald-600"><Check className="mr-1 inline h-3 w-3" />Đã thêm{item.shouldIndex ? "; index đã được xếp hàng." : "."}</p>}{item.status === "error" && <p className="mt-2 text-xs text-red-600">{item.error}</p>}
          </div>)}
          {drafts.length > 0 && <button type="button" onClick={commit} disabled={isCommitting || drafts.some((item) => !item.title.trim() || !item.sectionId)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{isCommitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Xác nhận thêm {drafts.length} file{indexed ? ` và index ${indexed} file` : ""}</button>}
          {complete && <p className="text-center text-xs text-slate-500">Bạn có thể thêm đợt file tiếp theo hoặc hỏi agent kiểm tra coverage sau khi index hoàn tất.</p>}
        </>}
      </div>
    </div>
  );
}
