"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { useLabAuthoring } from "@/hooks/labs/useLabAuthoring";
import { specialElementsExample, gitStepsExample } from "@/constants/labs/authoringExamples";
import type { AuthoringTask, LabAuthoringProposal, TestCaseDraft } from "@/types/labs/authoring";

interface LabAuthoringPanelProps {
  labId?: number; labType: string; source: Record<string, unknown>;
  existingRevision?: string;
  existingCases?: (TestCaseDraft & { id?: number })[];
  onApply: (proposal: LabAuthoringProposal) => void; onSaved?: () => void;
}
export function LabAuthoringPanel({ labId, labType, source, existingCases = [], existingRevision = "", onApply, onSaved }: LabAuthoringPanelProps) {
  const a = useLabAuthoring(labId, labType, source, existingCases, existingRevision, onSaved);
  useEffect(() => {
    if (!labId) return;
    const key = `lab-authoring-draft:${labId}`;
    const text = sessionStorage.getItem(key);
    if (text) { try { a.loadExample(JSON.parse(text)); } finally { sessionStorage.removeItem(key); } }
    // Load the teacher-reviewed draft carried over from Create once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId]);
  const tasks: { code: AuthoringTask; label: string }[] = [
    { code: "format_lab", label: "Format đề có sẵn → Markdown" },
    { code: "create_lab", label: "Ý tưởng → bài lab" },
    ...(labType !== "WORKSPACE" ? [{ code: "create_lab_testcase" as const, label: "Đề xuất bộ testcase" }, { code: "edit_testcase" as const, label: "Sửa bộ testcase hiện tại" }] : []),
    ...(labType === "CODING" ? [{ code: "create_lab_generator" as const, label: "Viết generator + lời giải tham chiếu" }] : []),
  ];
  return <details open className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <summary className="cursor-pointer font-semibold text-slate-900 dark:text-slate-100">Soạn lab với AI · Import · Sinh testcase</summary>
    <div className="mt-4 space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">AI tạo bản nháp để xem trước. Chọn áp dụng nội dung, lưu testcase hoặc thêm bước chấm điểm sau khi kiểm tra.</p>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Tác vụ AI" value={a.task} disabled={a.busy} onChange={e => a.setTask(e.target.value as AuthoringTask)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
          {tasks.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">Số test <Input aria-label="Số testcase" className="w-20" type="number" min={1} max={50} value={a.count} onChange={e => a.setCount(Number(e.target.value))} /></label>
        {labType !== "DATABASE" && <Button type="button" variant="outline" disabled={a.busy} onClick={() => a.loadExample(labType === "WORKSPACE" ? gitStepsExample : specialElementsExample)}>{labType === "WORKSPACE" ? "Mẫu Git từng bước" : "Mẫu bài nums → 21, 63"}</Button>}
      </div>
      <Textarea aria-label="Đề bài hoặc ý tưởng" rows={5} value={a.instruction} onChange={e => a.setInstruction(e.target.value)} placeholder="Dán đề LeetCode nguyên văn, nhập ý tưởng lab, hoặc mô tả testcase cần tạo/sửa…" />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={a.busy} onClick={a.request}>{a.busy ? "Đang xử lý…" : "Tạo bản nháp AI"}</Button>
        {a.job && <><span className="text-xs text-slate-500">Job {a.job.id.slice(0, 8)} · {a.job.status}</span><Button type="button" variant="outline" disabled={a.busy} onClick={a.refreshJob}>Kiểm tra job</Button></>}
      </div>
      {a.proposal && <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="font-semibold">Bản nháp: {a.proposal.title}</h3>
        <MarkdownRenderer content={a.proposal.description} />
        {a.proposal.warnings.map((warning, i) => <p key={i} className="text-sm text-amber-700 dark:text-amber-300">{warning}</p>)}
        {!!Object.keys(a.proposal.starter_code).length && <details><summary className="cursor-pointer text-sm font-medium">Starter code</summary>{Object.entries(a.proposal.starter_code).map(([lang, code]) => <pre key={lang} className="mt-2 overflow-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-950">{lang}{"\n"}{code}</pre>)}</details>}
        {(a.proposal.schema_sql || a.proposal.seed_sql) && <pre className="overflow-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-950">{a.proposal.schema_sql}{"\n"}{a.proposal.seed_sql}</pre>}
        <Button type="button" variant="outline" disabled={a.busy} onClick={() => onApply(a.proposal!)}>Áp dụng nội dung vào form</Button>
        <p className="text-xs text-slate-500">Sau khi áp dụng, dùng nút Lưu nội dung và Lưu runtime của form để lưu thay đổi.</p>
        {!!a.proposal.runtime_tasks.length && <>
          {a.proposal.runtime_tasks.map((step, i) => <details key={i}><summary className="cursor-pointer text-sm">Bước {i + 1}: {step.title} · trọng số {step.weight}{step.is_required ? " · bắt buộc" : ""}</summary><MarkdownRenderer content={step.description} /><pre className="overflow-auto text-xs">{JSON.stringify({ type: step.verifier_type, config: step.verifier_config }, null, 2)}</pre></details>)}
          <Button type="button" disabled={!labId || a.busy} onClick={a.saveSteps}>Thêm {a.proposal.runtime_tasks.length} bước chấm điểm vào lab</Button>
        </>}
      </div>}
      {labType !== "WORKSPACE" && <>
        <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <label className="block text-sm font-medium">Import testcase: JSON/JSONL hoặc các cặp cùng tên .in/.out, .input/.output
            <Input className="mt-2" type="file" multiple accept=".json,.jsonl,.in,.out,.input,.output" disabled={a.busy} onChange={e => { a.importFiles(Array.from(e.target.files || [])); e.target.value = ""; }} />
          </label>
          <p className="text-xs text-slate-500">JSON: [{'{"name":"Sample","input":"…","expected":"…","is_sample":true}'}]. SQL: input là fixture SQL bổ sung, expected là CSV có header. Tối đa 50 test/lab.</p>
        </div>
        {labType === "CODING" && <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">Sinh test bằng Python trong sandbox</summary>
          <p className="text-xs text-slate-500">Generator đọc JSON {`{"seed":42,"index":0,"count":10}`} qua stdin, in một input cho mỗi lần chạy. Lời giải tham chiếu đọc input đó, in output. Lưu sample đúng trước khi chạy.</p>
          <label className="block text-sm">Generator<Textarea className="mt-1 font-mono text-xs" rows={8} value={a.generator} onChange={e => a.setGenerator(e.target.value)} /></label>
          <label className="block text-sm">Lời giải tham chiếu (chỉ dành cho giáo viên)<Textarea className="mt-1 font-mono text-xs" rows={8} value={a.reference} onChange={e => a.setReference(e.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm">Seed<Input className="w-28" type="number" value={a.seed} onChange={e => a.setSeed(Number(e.target.value))} /></label>
          <Button type="button" disabled={!labId || a.busy} onClick={a.generate}>Kiểm tra sample và sinh {a.count} testcase</Button>
        </details>}
        {a.caseText && <div className="space-y-3">
          <label className="block text-sm font-medium">Xem và sửa bộ test trước khi lưu<Textarea className="mt-2 font-mono text-xs" rows={12} value={a.caseText} onChange={e => a.setCaseText(e.target.value)} /></label>
          <p className="text-xs text-amber-700 dark:text-amber-300">Output AI/import cần được kiểm tra. Generator tính output từ lời giải tham chiếu đã pass sample; sample không chứng minh lời giải đúng cho mọi input.</p>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={a.replace} onChange={e => a.setReplace(e.target.checked)} />Thay toàn bộ bộ test hiện tại ({existingCases.length} test). Bỏ chọn để thêm vào.</label>
          <Button type="button" disabled={!labId || a.busy} onClick={a.saveCases}>{a.replace ? "Thay bộ test bằng bản đã xem" : "Thêm bộ test đã xem vào lab"}</Button>
          {!labId && <p className="text-xs text-slate-500">Áp dụng nội dung rồi tạo lab; bản nháp được chuyển sang trang chỉnh sửa để lưu testcase.</p>}
        </div>}
      </>}
    </div>
  </details>;
}

export default LabAuthoringPanel;
