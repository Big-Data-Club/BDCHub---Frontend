"use client";

import { useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { competencyService, type CompetencySuggestion } from "@/services/lms/competencyService";

export default function CompetencyFrameworksPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [audience, setAudience] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [draft, setDraft] = useState<CompetencySuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createDraft = async () => {
    setLoading(true); setError("");
    try {
      setDraft(await competencyService.suggest({ title, subject, audience, source_text: sourceText, language: "vi" }));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tạo bản nháp. Vui lòng thử lại.");
    } finally { setLoading(false); }
  };

  return <div className="max-w-5xl space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Khung năng lực</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-300">AI hỗ trợ tạo bản nháp; Admin vẫn phải kiểm tra và xác nhận trước khi xuất bản.</p>
    </div>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2 font-semibold"><BrainCircuit className="h-5 w-5 text-violet-600" />Tạo bản nháp bằng AI</div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Tên khung năng lực<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Toán lớp 10" className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-800" /></label>
        <label className="text-sm font-medium">Môn/chủ đề<input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ví dụ: Toán học" className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-800" /></label>
        <label className="text-sm font-medium md:col-span-2">Đối tượng học<input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ví dụ: Học sinh lớp 10" className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-800" /></label>
        <label className="text-sm font-medium md:col-span-2">Mô tả hoặc nội dung nguồn (không bắt buộc)<textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-800" placeholder="Dán đề cương, chuẩn đầu ra hoặc mô tả khóa học…" /></label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button disabled={loading || title.trim().length < 3} onClick={createDraft} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50"><Sparkles className="h-4 w-4" />{loading ? "AI đang phân tích…" : "Tạo bản nháp"}</button>
    </section>
    {draft && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="font-semibold text-amber-900 dark:text-amber-100">Bản nháp chưa được xuất bản: {draft.framework_name} ({draft.framework_code})</p>
      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">Hãy kiểm tra mã, mô tả và quan hệ tiên quyết trước khi lưu vào khung năng lực.</p>
      <div className="mt-4 space-y-3">{draft.competencies.map((item) => <article key={item.code} className="rounded-lg bg-white p-4 dark:bg-slate-900"><div className="font-semibold">{item.code} · {item.name}</div><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>{item.prerequisite_codes.length > 0 && <p className="mt-2 text-xs text-slate-500">Tiên quyết: {item.prerequisite_codes.join(", ")}</p>}</article>)}</div>
    </section>}
  </div>;
}
