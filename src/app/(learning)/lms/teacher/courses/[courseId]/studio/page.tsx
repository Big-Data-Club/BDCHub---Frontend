"use client";

/**
 * Content Studio (Trạm sáng tác) - P0: Slides + Document.
 * Flow: Collect → Plan (LLM, editable) → Generate → Review & Publish.
 */
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Wand2, FileText, Presentation, BookOpen, Plus,
  Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
  Save, Rocket, Eye, RefreshCw, Layers,
} from "lucide-react";
import { studioService, type StudioProject } from "@/services/ai/studioService";
import lmsService from "@/services/lms/lmsService";
import { aiService } from "@/services/ai/aiService";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import AIRevisionPanel from "@/components/lms/teacher/AIRevisionPanel";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "academic", label: "Academic (navy)", dot: "#2554D2" },
  { value: "modern", label: "Modern (dark cyan)", dot: "#22D3EE" },
  { value: "minimal", label: "Minimal (light)", dot: "#E2622B" },
];

const STEPS = ["Thu thập", "Lên kế hoạch", "Tạo nội dung", "Xem trước & Đăng tải"];

export default function StudioPage() {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = Number(courseIdParam);

  const [step, setStep] = useState(0);
  const [project, setProject] = useState<StudioProject | null>(null);
  const [kind, setKind] = useState<"slides" | "document">("slides");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("academic");
  const [slideCount, setSlideCount] = useState(8);

  // collect
  const [nodes, setNodes] = useState<{ id: number; name: string }[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Set<number>>(new Set());
  const [pasteText, setPasteText] = useState("");
  const [addingSource, setAddingSource] = useState(false);
  const [collectError, setCollectError] = useState("");

  // plan / generate
  const [busy, setBusy] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [dirtyDraft, setDirtyDraft] = useState<{ title: string; key_points: string[]; slide_bullets: string[]; narration: string } | null>(null);
  const [pollRef, setPollRef] = useState<ReturnType<typeof setInterval> | null>(null);

  // publish
  const [sections, setSectionsList] = useState<{ id: number; title: string }[]>([]);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    aiListNodes();
    lmsService.listSections(courseId)
      .then((res) => setSectionsList((res?.data ?? []).map((s: any) => ({ id: s.id, title: s.title }))))
      .catch(() => {});
    return () => { if (pollRef) clearInterval(pollRef); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const aiListNodes = async () => {
    try {
      const list = await aiService.listKnowledgeNodes(courseId);
      setNodes((list ?? []).map((n: any) => ({ id: n.id, name: n.name_vi ?? n.name })));
    } catch {}
  };

  const ensureProject = useCallback(async () => {
    if (project) return project;
    const created = await studioService.createProject({
      course_id: courseId, kind, title: title || "Bài giảng chưa đặt tên",
      settings: { theme, slide_count: slideCount },
    });
    setProject(created);
    return created;
  }, [project, courseId, kind, title, theme, slideCount]);

  const addSources = async () => {
    setAddingSource(true); setCollectError(""); setError("");
    try {
      const proj = await ensureProject();
      for (const nid of selectedNodes) {
        const n = nodes.find((x) => x.id === nid);
        await studioService.addContext(proj.id, { type: "node", title: n?.name ?? `Node ${nid}`, ref: nid });
      }
      if (pasteText.trim()) {
        await studioService.addContext(proj.id, { type: "text", title: "Văn bản dán", text: pasteText.trim() });
      }
      setSelectedNodes(new Set()); setPasteText("");
      setProject(await studioService.getProject(proj.id));
    } catch (err: any) {
      setCollectError(err.message ?? "Không thêm được nguồn.");
    } finally {
      setAddingSource(false);
    }
  };

  const doPlan = async () => {
    setBusy("plan"); setError("");
    try {
      const proj = await ensureProject();
      const res = await studioService.generatePlan(proj.id, slideCount);
      setProject(res.project); setWarnings(res.warnings ?? []);
      setStep(1);
    } catch (err: any) { setError(err.message); } finally { setBusy(null); }
  };

  const savePlanEdits = async () => {
    if (!project?.plan) return;
    setBusy("savePlan");
    try {
      const res = await studioService.updatePlan(project.id, project.plan);
      setProject(res.project);
    } catch (err: any) { setError(err.message); } finally { setBusy(null); }
  };

  const startGenerate = async () => {
    setBusy("generate"); setError("");
    try {
      await studioService.startGenerate(project!.id);
      const interval = setInterval(async () => {
        const p = await studioService.getProject(project!.id);
        setProject(p);
        if (p.status === "ready" || p.status === "failed") {
          clearInterval(interval); setBusy(null); setStep(3);
        }
      }, 2500);
      setPollRef(interval);
    } catch (err: any) { setError(err.message); setBusy(null); }
  };

  const saveSectionEdit = async () => {
    if (!project || editIdx === null || !dirtyDraft) return;
    setBusy(`sec-${editIdx}`);
    try {
      const res = await studioService.updateSection(project.id, editIdx, dirtyDraft);
      setProject(res.project);
      setEditIdx(null); setDirtyDraft(null);
    } catch (err: any) { setError(err.message); } finally { setBusy(null); }
  };

  const publish = async (asType: "DOCUMENT" | "TEXT") => {
    if (!project || !sectionId) return;
    setPublishing(true); setError("");
    try {
      let contentId: number | undefined;
      if (asType === "DOCUMENT") {
        const pptx = project.artifacts.find((a) => a.type === "pptx");
        if (!pptx) throw new Error("Chưa có file PPTX.");
        // Fetch artifact server-side via same-origin path then re-upload to LMS
        const blob = await (await fetch(pptx.url)).blob();
        const fd = new FormData();
        fd.append("file", new File([blob], `${project.title}.pptx`, { type: blob.type }));
        const up = await fetch(`/lmsapiv1/files/upload`, {
          method: "POST", body: fd,
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        });
        const upJson = await up.json();
        const info = upJson?.data ?? {};
        const created = await lmsService.createContent(sectionId, {
          type: "DOCUMENT",
          title: project.title,
          description: "Tạo bằng Content Studio",
          order_index: 9999,
          is_mandatory: false,
          metadata: {
            file_path: info.file_path ?? pptx.url,
            file_name: info.file_name ?? `${project.title}.pptx`,
            file_size: info.file_size,
          },
        });
        contentId = created?.data?.id;
      } else {
        const mdArt = project.artifacts.find((a) => a.type === "markdown");
        const markdown = mdArt?.inline ?? "";
        const created = await lmsService.createContent(sectionId, {
          type: "TEXT",
          title: project.title,
          description: "Bài giảng tạo bằng Content Studio",
          order_index: 9999,
          is_mandatory: false,
          metadata: { content: markdown },
        });
        contentId = created?.data?.id;
      }
      if (contentId) router.push(`/lms/teacher/courses/${courseId}/content`);
    } catch (err: any) {
      setError(err?.message ?? "Đăng tải thất bại.");
    } finally {
      setPublishing(false);
    }
  };

  const plan = project?.plan;
  const artifacts = project?.artifacts ?? [];

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-md">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Trạm sáng tác bài giảng</h2>
          <p className="text-xs text-slate-500">Thu thập → Lên kế hoạch (AI) → Tạo slide/tài liệu → Xem trước & đăng tải.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i <= step && setStep(i)}
            disabled={i > step}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
              i === step ? "bg-blue-600 text-white shadow-sm" :
              i < step ? "bg-blue-50 dark:bg-cyan-950/30 text-blue-600 dark:text-cyan-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}
          >
            <span className="w-4 h-4 grid place-items-center rounded-full border current">{i + 1}</span>{s}
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 opacity-40 ml-0.5" />}
          </button>
        ))}
      </div>

      {/* STEP 0 - COLLECT */}
      {step === 0 && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] p-5 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-violet-500" /> Thông tin chung</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề bài giảng"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: "slides", label: "Slide bài giảng", icon: Presentation },
                { v: "document", label: "Tài liệu học tập", icon: BookOpen },
              ] as const).map((k) => (
                <button key={k.v} onClick={() => setKind(k.v)}
                  className={cn("p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                    kind === k.v ? "border-blue-500 bg-blue-50/60 dark:bg-cyan-950/30 dark:border-cyan-500/50" : "hover:border-blue-300")}>
                  <k.icon className="w-5 h-5 mb-1.5 text-blue-600 dark:text-cyan-400" />
                  <p className="text-xs font-bold">{k.label}</p>
                </button>
              ))}
            </div>
            {kind === "slides" && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Theme</label>
                  {THEMES.map((t) => (
                    <button key={t.value} onClick={() => setTheme(t.value)} title={t.label}
                      className={cn("w-7 h-7 rounded-full border-2 cursor-pointer transition-all", theme === t.value ? "scale-110 border-slate-900 dark:border-white" : "border-transparent")}
                      style={{ backgroundColor: t.dot }} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Số mục</label>
                  <input type="number" min={4} max={20} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-sm" />
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" /> Nguồn tư liệu</h3>
            {nodes.length > 0 ? (
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {nodes.map((n) => (
                  <label key={n.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#12223a] cursor-pointer text-xs">
                    <input type="checkbox" checked={selectedNodes.has(n.id)}
                      onChange={() => setSelectedIds(setNodes, n.id)} className="w-3.5 h-3.5" />
                    <span className="truncate">{n.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Chưa có knowledge node - có thể dùng nguồn văn bản bên dưới.</p>
            )}
            <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={3}
              placeholder="Hoặc dán thêm nội dung/giáo trình..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-xs resize-none" />
            <button onClick={addSources} disabled={addingSource || (selectedNodes.size === 0 && !pasteText.trim())}
              className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all cursor-pointer">
              {addingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Thêm vào Context Pack {project ? `(${(project.context_pack ?? []).length})` : ""}
            </button>
            {collectError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{collectError}</p>}
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <NextBtn
              disabled={busy === "plan" || !project || (project.context_pack ?? []).length === 0}
              onClick={() => {
                if (!project?.plan) {
                  doPlan();
                } else {
                  setStep(1);
                }
              }}
            >
              {busy === "plan" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Chuyển sang lập kế hoạch
            </NextBtn>
          </div>
        </div>
      )}

      {/* STEP 1 - PLAN */}
      {step === 1 && (
        <div className="space-y-4">
          {warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-700 dark:text-amber-300 font-medium">
              {warnings.join(" · ")}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{plan?.sections?.length ?? 0} mục · chỉnh sửa trực tiếp bên dưới rồi bấm Lưu.</p>
            <div className="flex items-center gap-2">
              <button onClick={doPlan} disabled={busy === "plan"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#12223a] text-xs font-semibold cursor-pointer">
                {busy === "plan" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Tạo lại kế hoạch
              </button>
              <button onClick={savePlanEdits} disabled={busy === "savePlan"}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
                {busy === "savePlan" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu kế hoạch
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {plan?.sections?.map((sec, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] p-4 space-y-2">
                <input value={sec.title} onChange={(e) => mutateSection(i, "title", e.target.value)}
                  className="w-full text-sm font-bold bg-transparent outline-none text-slate-900 dark:text-white" />
                <textarea value={(sec.slide_bullets ?? sec.key_points ?? []).join("\n")} rows={3}
                  onChange={(e) => mutateSection(i, "slide_bullets", e.target.value.split("\n").filter(Boolean))}
                  placeholder="Gạch đầu dòng hiển thị trên slide (mỗi dòng 1 ý)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-xs resize-y" />
                <div className="grid gap-2 md:grid-cols-[150px_1fr]">
                  <select value={sec.visual_type ?? "auto"} onChange={(e) => mutateSection(i, "visual_type", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 text-xs font-semibold">
                    <option value="auto">✨ Sơ đồ tự động</option>
                    <option value="flow">→ Quy trình</option>
                    <option value="cycle">↻ Chu trình</option>
                    <option value="comparison">⇄ So sánh</option>
                    <option value="hierarchy">⌘ Phân cấp</option>
                    <option value="timeline">•• Dòng thời gian</option>
                  </select>
                  <input value={(sec.visual_labels ?? []).join(" → ")}
                    onChange={(e) => mutateSection(i, "visual_labels", e.target.value.split(/\s*(?:→|\||;)\s*/).filter(Boolean).slice(0, 6))}
                    placeholder="Các nhãn trong hình, ngăn bằng → (2–6 nhãn)"
                    className="px-3 py-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/10 text-xs" />
                </div>
                <input value={sec.visual_suggestion ?? ""} onChange={(e) => mutateSection(i, "visual_suggestion", e.target.value)}
                  placeholder="Chú thích hình minh họa"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-xs" />
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 dark:text-cyan-400 font-semibold">Kịch bản thuyết trình</summary>
                  <textarea value={sec.narration} rows={4}
                    onChange={(e) => mutateSection(i, "narration", e.target.value)}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] resize-y" />
                </details>
              </div>
            ))}
          </div>
          <StepperNav onBack={() => setStep(0)} onNext={startGenerate} nextLabel={busy === "generate" ? undefined : "🪄 Bắt đầu tạo Slide / Bài viết"} busy={busy === "generate"} />
        </div>
      )}

      {/* STEP 2 - GENERATING */}
      {step === 2 && (
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {project?.status === "failed" ? "Tạo thất bại" : "Đang dựng nội dung..."}
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            {project?.status === "failed"
              ? project.error_detail
              : "AI đang viết từng mục theo kế hoạch đã duyệt. Việc này thường mất dưới một phút."}
          </p>
          {project?.status === "failed" && (
            <button onClick={startGenerate} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer">Thử lại</button>
          )}
        </div>
      )}

      {/* STEP 3 - REVIEW & PUBLISH */}
      {step === 3 && (
        <div className="space-y-5">
          {project?.status === "ready" ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {artifacts.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer">
                    {a.type === "pptx" ? <Presentation className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    Tải {a.type.toUpperCase()}
                  </a>
                ))}
                <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sẵn sàng đăng tải
                </span>
              </div>

              {/* Inline section review */}
              <div className="space-y-3">
                {plan?.sections.map((sec, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] p-4">
                    {editIdx === i ? (
                      <div className="space-y-2">
                        <AIRevisionPanel
                          kind="slide_section"
                          label="AI chỉnh sửa mục slide"
                          source={{
                            title: dirtyDraft!.title, key_points: dirtyDraft!.key_points,
                            slide_bullets: dirtyDraft!.slide_bullets, narration: dirtyDraft!.narration,
                            visual_suggestion: sec.visual_suggestion ?? "", visual_type: sec.visual_type ?? "auto",
                            visual_labels: sec.visual_labels ?? [],
                          }}
                          onApply={(proposal) => setDirtyDraft({
                            title: String(proposal.title ?? dirtyDraft!.title),
                            key_points: Array.isArray(proposal.key_points) ? proposal.key_points.map(String) : dirtyDraft!.key_points,
                            slide_bullets: Array.isArray(proposal.slide_bullets) ? proposal.slide_bullets.map(String) : dirtyDraft!.slide_bullets,
                            narration: String(proposal.narration ?? dirtyDraft!.narration),
                          })}
                        />
                        <input value={dirtyDraft!.title} onChange={(e) => setDirtyDraft({ ...dirtyDraft!, title: e.target.value })}
                          className="w-full text-sm font-bold bg-transparent outline-none border-b border-blue-300 pb-1 text-slate-900 dark:text-white" />
                        <textarea value={(dirtyDraft!.slide_bullets ?? []).join("\n")} rows={3}
                          onChange={(e) => setDirtyDraft({ ...dirtyDraft!, slide_bullets: e.target.value.split("\n").filter(Boolean) })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0D192E] text-xs" />
                        <div className="flex gap-2">
                          <button onClick={saveSectionEdit} disabled={busy === `sec-${i}`}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                            {busy === `sec-${i}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Lưu
                          </button>
                          <button onClick={() => { setEditIdx(null); setDirtyDraft(null); }}
                            className="px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <div className="group">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{i + 1}. {sec.title}</h4>
                          <button onClick={() => { setEditIdx(i); setDirtyDraft({ title: sec.title, key_points: sec.key_points ?? [], slide_bullets: sec.slide_bullets ?? sec.key_points ?? [], narration: sec.narration ?? "" }); }}
                            className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 dark:text-cyan-400 font-semibold flex items-center gap-1 cursor-pointer transition-opacity">
                            <RefreshCw className="w-3 h-3" /> Sửa mục này
                          </button>
                        </div>
                        <div className="mt-2 inline-flex rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                          Visual: {sec.visual_type ?? "auto"} · {(sec.visual_labels ?? []).length} nhãn
                        </div>
                        {(sec.slide_bullets ?? []).length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {sec.slide_bullets.map((b, bi) => (
                              <li key={bi} className="text-xs text-slate-600 dark:text-slate-300 flex gap-1.5">
                                <span className="text-blue-500">▸</span>{b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {artifacts.some((a) => a.type === "markdown") && (
                  <details className="rounded-2xl border border-slate-200 dark:border-blue-500/15 bg-white dark:bg-[#0F1E35] p-4">
                    <summary className="text-xs font-bold text-slate-500 cursor-pointer flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Xem bản tài liệu đầy đủ (Markdown)</summary>
                    <div className="mt-3 prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={artifacts.find((a) => a.type === "markdown")?.inline ?? ""} />
                    </div>
                  </details>
                )}
              </div>

              {/* Publish */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/15 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <Rocket className="w-5 h-5 text-emerald-600 shrink-0" />
                <select value={sectionId ?? ""} onChange={(e) => setSectionId(Number(e.target.value))}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D192E] text-sm">
                  {sections.length === 0 && <option value="">- Chưa có chương -</option>}
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <div className="flex gap-2">
                  {artifacts.some((a) => a.type === "pptx") && (
                    <PubBtn onClick={() => publish("DOCUMENT")} busy={publishing}>Đăng file Slide</PubBtn>
                  )}
                  {artifacts.some((a) => a.type === "markdown") && (
                    <PubBtn onClick={() => publish("TEXT")} busy={publishing}>Đăng tài liệu</PubBtn>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">Nội dung chưa sẵn sàng.</div>
          )}
          <button onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">← Quay lại bước tạo</button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}
    </div>
  );

  // ── helpers ────────────────────────────────────────────────────────────
  function setSelectedIds(_setter: unknown, id: number) {
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function mutateSection(i: number, field: string, value: any) {
    if (!project?.plan) return;
    const sections = [...project.plan.sections];
    sections[i] = { ...sections[i], [field]: value };
    setProject({ ...project, plan: { ...project.plan, sections } });
  }

  function NextBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
    return (
      <button onClick={onClick} disabled={disabled}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 active:scale-95 transition-all cursor-pointer">
        {children}<ChevronRight className="w-3.5 h-3.5" />
      </button>
    );
  }

  function StepperNav({ onBack, onNext, nextLabel, busy }: { onBack: () => void; onNext: () => void; nextLabel?: string; busy?: boolean }) {
    return (
      <div className="flex justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">
          <ChevronLeft className="w-3.5 h-3.5" /> Quay lại thu thập
        </button>
        <NextBtn onClick={onNext} disabled={busy}>
          {busy ? <>Đang lên kế hoạch… <Loader2 className="w-3.5 h-3.5 animate-spin" /></> : (nextLabel ?? "Tiếp tục")}
        </NextBtn>
      </div>
    );
  }

  function PubBtn({ children, onClick, busy }: { children: React.ReactNode; onClick: () => void; busy: boolean }) {
    return (
      <button onClick={onClick} disabled={busy}
        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50 active:scale-95 transition-all cursor-pointer">
        {children}
      </button>
    );
  }
}
