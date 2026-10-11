"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { labAuthoringService } from "@/services/labs/labAuthoringService";
import type { AuthoringJob, AuthoringTask, LabAuthoringProposal, TestCaseDraft } from "@/types/labs/authoring";
import { importTestcaseFiles, validateCaseDrafts } from "@/utils/labs/testcaseImport";

export function useLabAuthoring(labId: number | undefined, labType: string, source: Record<string, unknown>, existingCases: (TestCaseDraft & { id?: number })[], existingRevision: string, onSaved?: () => void) {
  const [task, setTask] = useState<AuthoringTask>("format_lab");
  const [instruction, setInstruction] = useState("");
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(42);
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState<AuthoringJob | null>(null);
  const [proposal, setProposal] = useState<LabAuthoringProposal | null>(null);
  const [caseText, setCaseText] = useState("");
  const [generator, setGenerator] = useState("");
  const [reference, setReference] = useState("");
  const [replace, setReplace] = useState(false);
  const baseline = useRef<number[]>([]);
  const baselineRevision = useRef("");
  useEffect(() => {
    let cancelled = false;
    setJob(null); setBusy(false); setProposal(null); setCaseText(""); setGenerator(""); setReference(""); setTask("format_lab");
    const key = `lab-authoring-job:${labId || "new"}:${labType}`;
    const id = sessionStorage.getItem(key);
    if (id) labAuthoringService.status(id).then(next => {
      if (cancelled) return; setJob(next);
      setBusy(["QUEUED", "RUNNING"].includes(next.status));
      if (next.proposal) load(next.proposal);
    }).catch(() => { if (!cancelled) sessionStorage.removeItem(key); });
    return () => { cancelled = true; };
    // Job ownership is rechecked by the server when resuming after reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId, labType]);
  const load = (value: LabAuthoringProposal) => {
    setProposal(value); setCaseText(value.test_cases.length ? JSON.stringify(value.test_cases, null, 2) : "");
    setGenerator(value.generator_code); setReference(value.reference_code);
  };
  useEffect(() => {
    if (!job || !["QUEUED", "RUNNING"].includes(job.status)) return;
    let cancelled = false; let pending = false;
    const started = Date.now();
    const timer = setInterval(async () => {
      if (pending) return; pending = true;
      try {
        const next = await labAuthoringService.status(job.id);
        if (cancelled) return;
        setJob(next);
        if (next.status === "READY" && next.proposal) { load(next.proposal); setBusy(false); }
        else if (next.status === "FAILED") { setBusy(false); toast.error(next.error || "AI không tạo được bản nháp."); }
        else if (Date.now() - started > 5 * 60000) { clearInterval(timer); setBusy(false); toast.error("Job vẫn đang xử lý. Dùng nút Kiểm tra job để xem lại trạng thái."); }
      } catch (error) { if (!cancelled) { clearInterval(timer); setBusy(false); toast.error(error instanceof Error ? error.message : "Không lấy được trạng thái job."); } }
      finally { pending = false; }
    }, 2000);
    return () => { cancelled = true; clearInterval(timer); };
    // Poll one durable job independently of changes to the editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status]);
  const guarded = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thực hiện được thao tác."); }
    finally { setBusy(false); }
  };
  const request = async () => {
    if (instruction.trim().length < 3) { toast.error("Nhập đề bài hoặc hướng dẫn cho AI."); return; }
    if (!Number.isInteger(count) || count < 1 || count > 50) { toast.error("Số test cần nằm trong 1–50."); return; }
    setBusy(true); baselineRevision.current = existingRevision; baseline.current = existingCases.map(c => c.id).filter((id): id is number => !!id);
    setReplace(task === "edit_testcase");
    try {
      if (labId && task === "edit_testcase" && !existingRevision) throw new Error("Tải bộ test hiện tại trước khi yêu cầu AI chỉnh sửa.");
      const next = await labAuthoringService.request(task, labType, instruction, { ...source, test_cases: existingCases }, count);
      sessionStorage.setItem(`lab-authoring-job:${labId || "new"}:${labType}`, next.id);
      setJob(next);
    }
    catch (error) { setBusy(false); toast.error(error instanceof Error ? error.message : "Không tạo được job."); }
  };
  const refreshJob = () => guarded(async () => { if (!job) return; const next = await labAuthoringService.status(job.id); setJob(next); if (next.proposal) load(next.proposal); });
  const importFiles = (files: File[]) => guarded(async () => { const cases = await importTestcaseFiles(files); baselineRevision.current = existingRevision; baseline.current = existingCases.map(c => c.id).filter((id): id is number => !!id); setReplace(false); setCaseText(JSON.stringify(cases, null, 2)); });
  const generate = () => guarded(async () => {
    if (!labId) throw new Error("Lưu lab trước khi chạy generator.");
    if (!Number.isSafeInteger(seed) || !Number.isInteger(count) || count < 1 || count > 50) throw new Error("Seed phải là số nguyên; số test nằm trong 1–50.");
    const samples = existingCases.filter(c => c.is_sample && !c.is_hidden);
    if (!samples.length) throw new Error("Lưu ít nhất một sample đúng để kiểm tra lời giải tham chiếu.");
    const response = await labAuthoringService.generate(labId, generator, reference, count, seed, samples);
    baselineRevision.current = existingRevision; baseline.current = existingCases.map(c => c.id).filter((id): id is number => !!id); setReplace(false);
    setCaseText(JSON.stringify(response.data.test_cases, null, 2)); toast.success("Đã tính output bằng lời giải tham chiếu. Xem trước rồi lưu.");
  });
  const saveCases = () => guarded(async () => {
    if (!labId) throw new Error("Lưu lab trước khi lưu testcase.");
    const cases = validateCaseDrafts(JSON.parse(caseText));
    if (replace) { if (!baselineRevision.current) throw new Error("Bộ test chưa được tải; tải lại lab rồi tạo bản nháp."); await labAuthoringService.replaceCases(labId, cases, baseline.current, baselineRevision.current); }
    else await labAuthoringService.appendCases(labId, cases);
    setCaseText(""); setProposal(prev => prev ? { ...prev, test_cases: [] } : null); onSaved?.(); toast.success("Đã lưu bộ testcase.");
  });
  const saveSteps = () => guarded(async () => {
    if (!labId || !proposal?.runtime_tasks.length) throw new Error("Lưu lab trước khi thêm nhiệm vụ.");
    await labAuthoringService.appendSteps(labId, proposal.runtime_tasks); setProposal(prev => prev ? { ...prev, runtime_tasks: [] } : null); onSaved?.(); toast.success("Đã thêm các bước chấm điểm.");
  });
  const loadExample = (value: LabAuthoringProposal) => { load(value); setReplace(false); baselineRevision.current = existingRevision; baseline.current = existingCases.map(c => c.id).filter((id): id is number => !!id); };
  return { task, setTask, instruction, setInstruction, count, setCount, seed, setSeed, busy, job, proposal, caseText, setCaseText, generator, setGenerator, reference, setReference, replace, setReplace, request, refreshJob, importFiles, generate, saveCases, saveSteps, loadExample };
}
