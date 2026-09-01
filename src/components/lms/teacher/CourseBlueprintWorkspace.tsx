"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import { getAccessToken } from "@/services/auth/authToken";
import { courseBlueprintService, type CourseBlueprint, type CourseBlueprintFile } from "@/services/lms/courseBlueprintService";
import type { Organization } from "@/types";
import { Select } from "@/components/lms/shared/Select";

type Uploaded = CourseBlueprintFile & { size: number };

export function CourseBlueprintWorkspace({ userId, organizations, onComplete, onCancel, onOpenBlueprint, blueprintId }: { userId: number; organizations: Organization[]; onComplete: (courseId: number) => Promise<void>; onCancel: () => void; onOpenBlueprint: (blueprintId: string) => void; blueprintId?: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Uploaded[]>([]);
  const [blueprint, setBlueprint] = useState<CourseBlueprint | null>(null);
  const [busy, setBusy] = useState<"upload" | "analyse" | "save" | "approve" | null>(null);
  const [error, setError] = useState("");
  const [blueprintLookup, setBlueprintLookup] = useState(blueprintId || "");

  useEffect(() => {
    if (!blueprintId || !userId) return;
    setBlueprintLookup(blueprintId); setBlueprint(null); setBusy("analyse"); setError("");
    courseBlueprintService.get(blueprintId, userId)
      .then((loaded) => setBlueprint(loaded))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể mở blueprint này."))
      .finally(() => setBusy(null));
  }, [blueprintId, userId]);

  const openBlueprint = () => {
    const id = blueprintLookup.trim().toLowerCase();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)) {
      setError("Blueprint ID phải là UUID hợp lệ, ví dụ 63942e5b-5284-40c0-a2de-8e9587233616.");
      return;
    }
    setError("");
    onOpenBlueprint(id);
  };

  const blueprintLookupPanel = <form onSubmit={(event) => { event.preventDefault(); openBlueprint(); }} className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-950/20"><label htmlFor="blueprint-id" className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mở blueprint đã có</label><p className="mt-1 text-xs text-slate-500">Dán Blueprint ID do MCP trả về để xem, duyệt và đưa thành course DRAFT.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input id="blueprint-id" value={blueprintLookup} onChange={(event) => setBlueprintLookup(event.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-blue-500/20 dark:bg-[#0D192E] dark:text-slate-100" /><button type="submit" disabled={!!busy || !blueprintLookup.trim()} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{busy === "analyse" && blueprintId ? "Đang mở…" : "Mở blueprint"}</button></div></form>;

  const upload = async (selected: FileList | null) => {
    if (!selected?.length) return;
    setBusy("upload"); setError("");
    try {
      const token = await getAccessToken();
      const uploaded: Uploaded[] = [];
      for (const file of Array.from(selected)) {
        const form = new FormData(); form.append("type", "document"); form.append("file", file);
        const res = await fetch("/lmsapiv1/files/upload", { method: "POST", body: form, credentials: "include", headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        const raw = await res.text();
        let json: { data?: { file_path?: string; file_name?: string }; error?: string; message?: string } | null = null;
        try { json = raw ? JSON.parse(raw) : null; } catch { /* Gateway/auth errors may be HTML. */ }
        if (!res.ok || !json?.data?.file_path) {
          const reason = json?.error || json?.message || (res.status === 401 ? "Phiên đăng nhập đã hết hạn" : res.status === 413 ? "File vượt quá giới hạn upload" : `Máy chủ trả về lỗi ${res.status}`);
          throw new Error(`${file.name}: ${reason}`);
        }
        uploaded.push({ id: crypto.randomUUID(), filename: file.name, file_path: json.data.file_path, content_type: file.type || "application/octet-stream", size: file.size });
      }
      setFiles((current) => [...current, ...uploaded]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Tải file thất bại"); }
    finally { setBusy(null); if (input.current) input.current.value = ""; }
  };

  const analyse = async () => {
    if (!files.length || !organizations.length) return;
    setBusy("analyse"); setError("");
    try {
      const org = organizations[0];
      let next = await courseBlueprintService.create({ owner_id: userId, origin: "course_create", documents: files, allowed_organization_ids: organizations.map((item) => item.id), governance: { organization_id: org.id, visibility: "ORG_ONLY", co_teacher_ids: [] } });
      setBlueprint(next);
      const deadline = Date.now() + 20 * 60 * 1000;
      while (next.status === "PROCESSING" && Date.now() < deadline) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        next = await courseBlueprintService.get(next.id, userId);
        setBlueprint(next);
      }
      if (next.status === "FAILED") throw new Error(next.error_message || "AI không thể tạo đề xuất. Bạn có thể thử lại.");
      if (next.status === "PROCESSING") throw new Error("Việc phân tích vẫn đang chạy. Hãy giữ trang này mở hoặc thử lại sau ít phút.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "AI chưa thể tạo đề xuất"); }
    finally { setBusy(null); }
  };

  const save = async () => { if (!blueprint) return; setBusy("save"); try { setBlueprint(await courseBlueprintService.update(blueprint.id, { owner_id: userId, version: blueprint.version, plan: blueprint.plan })); } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể lưu chỉnh sửa"); } finally { setBusy(null); } };
  const approve = async () => { if (!blueprint) return; setBusy("approve"); try { const applied = await courseBlueprintService.apply(blueprint.id); await onComplete(applied.course_id); } catch (cause) { setError(cause instanceof Error ? cause.message : "Bạn cần hoàn tất các trường bắt buộc"); } finally { setBusy(null); } };
  const cancel = async () => { try { if (blueprint) await courseBlueprintService.cancel(blueprint.id); onCancel(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể hủy đề xuất"); } };
  const patch = (fn: (plan: CourseBlueprint["plan"]) => CourseBlueprint["plan"]) => setBlueprint((current) => current ? { ...current, plan: fn(current.plan) } : current);

  const planReady = ["DRAFT", "APPROVED", "APPLIED"].includes(blueprint?.status || "") && Array.isArray(blueprint?.plan?.chapters);
  const isLegacyExternalBlueprint = blueprint?.origin === "chatbot";
  if (blueprint && !planReady && blueprint.status !== "FAILED") return <div className="space-y-4">{blueprintLookupPanel}<section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start gap-3"><div className="rounded-xl bg-violet-100 p-2.5 text-violet-700"><Loader2 className="h-6 w-6 animate-spin" /></div><div><h1 className="text-xl font-bold">Đang xây roadmap từ tài liệu</h1><p className="mt-1 text-sm text-slate-500">Bạn có thể giữ trang này mở. Hệ thống đang đọc tài liệu theo từng phần; việc này không còn bị giới hạn bởi timeout trình duyệt.</p></div></div><button onClick={cancel} className="rounded-lg border px-4 py-2 text-sm">Hủy phân tích</button></section></div>;

  if (blueprint?.status === "FAILED") return <section className="space-y-4 rounded-2xl border border-red-200 bg-white p-6 shadow-sm"><h1 className="text-xl font-bold">Chưa thể tạo đề xuất</h1><p className="text-sm text-red-700">{blueprint.error_message || "AI không thể hoàn tất phân tích tài liệu."}</p><div className="flex gap-3"><button onClick={() => setBlueprint(null)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Thử lại</button><button onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm">Hủy</button></div></section>;

  if (blueprint) return <div className="space-y-4">{blueprintLookupPanel}<section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <header className="flex items-start gap-3"><div className="rounded-xl bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"><Sparkles /></div><div><h1 className="text-xl font-bold">Đề xuất roadmap từ giáo trình</h1><p className="text-sm text-slate-500">Bạn kiểm soát mọi thông tin trước khi tạo khóa học.</p></div></header>
    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">{error}</p>}
    {isLegacyExternalBlueprint && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/20 dark:text-blue-200">Đây là blueprint MCP cũ. Kiểm tra các chương và bài học bên dưới; khi duyệt, hệ thống sẽ tạo một course DRAFT riêng tư để bạn tiếp tục chỉnh sửa trước khi publish.</p>}
    {(blueprint.validation?.errors || []).map((item) => <p key={item.code} className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">{item.message}</p>)}
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm font-medium">Tên khóa học
        <input value={blueprint.plan.title} onChange={(e) => patch((p) => ({ ...p, title: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] p-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-cyan-400/50" />
      </label>
      <Select
        label="Organization"
        value={String(blueprint.plan.governance?.organization_id || "")}
        onValueChange={(val) => patch((p) => ({ ...p, governance: { organization_id: Number(val), visibility: p.governance?.visibility || "ORG_ONLY", co_teacher_ids: p.governance?.co_teacher_ids || [] } }))}
        options={organizations.map((org) => ({ value: String(org.id), label: org.name }))}
        placeholder="Chọn Organization..."
      />
      <label className="text-sm font-medium md:col-span-2">Mô tả
        <textarea value={blueprint.plan.description} onChange={(e) => patch((p) => ({ ...p, description: e.target.value }))} className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-cyan-400/50" />
      </label>
    </div>
    <div><h2 className="mb-2 font-semibold">Chương học</h2><div className="space-y-3">{blueprint.plan.chapters.map((chapter, index) => <article key={chapter.id || index} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs font-semibold text-violet-600">CHƯƠNG {index + 1} · {chapter.lessons?.length ? `${chapter.lessons.length} bài học` : `dựa trên ${chapter.material_ids?.length || 0} tài liệu`}</p><input value={chapter.title} onChange={(e) => patch((p) => ({ ...p, chapters: p.chapters.map((c, chapterIndex) => chapterIndex === index ? { ...c, title: e.target.value } : c) }))} className="mt-1 w-full border-0 bg-transparent text-base font-semibold outline-none" /><textarea value={chapter.description} onChange={(e) => patch((p) => ({ ...p, chapters: p.chapters.map((c, chapterIndex) => chapterIndex === index ? { ...c, description: e.target.value } : c) }))} className="mt-2 min-h-16 w-full rounded-lg border p-2 text-sm dark:bg-slate-950" /><p className="mt-2 text-xs text-slate-500">Tiên quyết: {chapter.prerequisites?.length ? chapter.prerequisites.join(", ") : "Không có"}</p>{chapter.lessons?.length ? <ol className="mt-3 space-y-1 border-t pt-3 text-sm text-slate-600 dark:text-slate-300">{chapter.lessons.map((lesson, lessonIndex) => <li key={`${lesson.title}-${lessonIndex}`}>{lessonIndex + 1}. {lesson.title}{lesson.description ? <span className="text-slate-400"> — {lesson.description}</span> : null}</li>)}</ol> : null}</article>)}</div></div>
    <footer className="flex flex-wrap justify-end gap-3 border-t pt-5">{blueprint.status === "APPLIED" && blueprint.applied_course_id ? <button onClick={() => onComplete(blueprint.applied_course_id!)} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4" />Mở course DRAFT #{blueprint.applied_course_id}</button> : <>{!isLegacyExternalBlueprint && <><button onClick={cancel} className="rounded-lg px-4 py-2 text-sm">Hủy</button><button disabled={!!busy} onClick={save} className="rounded-lg border px-4 py-2 text-sm font-semibold">{busy === "save" ? "Đang lưu…" : "Lưu thay đổi"}</button></>}<button disabled={!!busy} onClick={approve} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4" />{busy === "approve" ? "Đang tạo course DRAFT…" : isLegacyExternalBlueprint ? "Duyệt & đưa lên Course DRAFT" : "Duyệt & tạo khóa học"}</button></>}</footer>
  </section></div>;

  return <div className="space-y-4">{blueprintLookupPanel}<section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-6"><h1 className="text-2xl font-bold">Tạo khóa học từ tài liệu</h1><p className="mt-1 text-sm text-slate-500">Tải mọi loại file: giáo trình, slide, ảnh, dữ liệu, notebook, source code hoặc script. AI chỉ suy luận từ nội dung đọc được; file binary vẫn được lưu và gắn vào course.</p></div>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<input ref={input} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} /><button type="button" onClick={() => input.current?.click()} disabled={!!busy} className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/60 text-violet-800 transition hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20 dark:text-violet-200"><Upload className="mb-2 h-7 w-7" /><span className="font-semibold">Chọn nhiều file bất kỳ</span><span className="mt-1 text-xs">Tài liệu, ảnh, code, dataset, notebook, script, archive và định dạng chuyên ngành</span></button><div className="mt-4 space-y-2">{files.map((file) => <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3"><FileText className="h-4 w-4 text-violet-600" /><span className="min-w-0 flex-1 truncate text-sm">{file.filename}</span><span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span><button onClick={() => setFiles((items) => items.filter((item) => item.id !== file.id))} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button></div>)}</div><div className="mt-6 flex justify-between"><button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm">Hủy</button><button disabled={!files.length || !organizations.length || !!busy} onClick={analyse} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{busy === "upload" ? "Đang tải…" : busy === "analyse" ? "Đang phân tích…" : "Nhận đề xuất AI"}</button></div></section></div>;
}
