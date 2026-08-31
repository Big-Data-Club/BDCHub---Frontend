"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { previewAIRevision, type RevisionKind } from "@/services/ai/revisionService";

interface Props<T extends Record<string, unknown>> {
  kind: RevisionKind;
  source: T;
  onApply: (proposal: T) => void;
  label?: string;
}

export default function AIRevisionPanel<T extends Record<string, unknown>>({ kind, source, onApply, label = "AI chỉnh sửa" }: Props<T>) {
  const [instruction, setInstruction] = useState("");
  const [proposal, setProposal] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preview = async () => {
    if (instruction.trim().length < 3) {
      setError("Hãy mô tả điều bạn muốn AI chỉnh sửa.");
      return;
    }
    setLoading(true); setError("");
    try {
      setProposal(await previewAIRevision(kind, instruction.trim(), source));
    } catch (err: any) {
      setError(err?.message || "Không thể tạo đề xuất.");
    } finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-violet-200 dark:border-violet-500/25 bg-violet-50/60 dark:bg-violet-950/15 p-3 space-y-2.5">
      <div className="flex items-center gap-2 text-sm font-bold text-violet-800 dark:text-violet-200"><Sparkles className="w-4 h-4" />{label}</div>
      <p className="text-xs text-violet-700/80 dark:text-violet-300/80">AI chỉ tạo bản đề xuất. Nội dung hiện tại không đổi cho đến khi bạn bấm Áp dụng.</p>
      <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={2}
        placeholder="Ví dụ: Rút gọn phần này cho sinh viên năm nhất, thêm một ví dụ thực tế."
        className="w-full rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-violet-400" />
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
      {!proposal ? <button type="button" onClick={preview} disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Xem đề xuất
      </button> : <>
        <details open className="rounded-lg border border-violet-200/80 dark:border-violet-800 bg-white/80 dark:bg-slate-900/70 p-2">
          <summary className="cursor-pointer text-xs font-semibold text-violet-800 dark:text-violet-200">Xem bản AI đề xuất trước khi áp dụng</summary>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] text-slate-700 dark:text-slate-300">{JSON.stringify(proposal, null, 2)}</pre>
        </details>
        <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { onApply(proposal); setProposal(null); setInstruction(""); }} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"><Check className="w-3.5 h-3.5" /> Áp dụng vào bản nháp</button>
        <button type="button" onClick={() => setProposal(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"><X className="w-3.5 h-3.5" /> Bỏ đề xuất</button>
        </div>
      </>}
    </div>
  );
}
