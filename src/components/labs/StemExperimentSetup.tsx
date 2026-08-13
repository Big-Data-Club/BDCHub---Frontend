"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Beaker,
  Bot,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  GitBranch,
  Leaf,
  Loader2,
  Rocket,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { labService } from "@/services/labService";
import type {
  ExperimentDefinition,
  ExperimentVariable,
  InquiryLevel,
  Lab,
  LabValidationIssue,
  LabVersion,
} from "@/types";

type Props = {
  lab: Lab;
  onPublished?: () => void | Promise<void>;
};

const workflowNodes = [
  { key: "predict", type: "PREDICTION", title: "Dự đoán kết quả", evidence: ["prediction"] },
  { key: "configure", type: "CONFIGURE", title: "Thiết lập biến thí nghiệm", evidence: [] },
  { key: "run", type: "RUN", title: "Chạy mô phỏng", evidence: [] },
  { key: "measure", type: "MEASURE", title: "Đo và ghi dữ liệu", evidence: ["measurement_table"] },
  { key: "analyze", type: "ANALYZE", title: "Phân tích dữ liệu", evidence: ["chart_and_interpretation"] },
  { key: "explain", type: "EXPLAIN", title: "Giải thích theo CER", evidence: ["claim_evidence_reasoning"] },
  { key: "iterate", type: "ITERATE", title: "Thay đổi một biến và thử lại", evidence: ["change_reason"] },
  { key: "reflect", type: "REFLECT", title: "Phản tư và kết luận", evidence: ["reflection"] },
];

const buildWorkflow = () => ({
  nodes: workflowNodes.map((node, index) => ({
    key: node.key,
    type: node.type,
    title: node.title,
    config: {},
    requiredEvidence: node.evidence,
    orderHint: index + 1,
  })),
  edges: workflowNodes.slice(0, -1).map((node, index) => ({
    from: node.key,
    to: workflowNodes[index + 1].key,
    conditionExpression: "always",
    priority: index + 1,
  })),
});

const plantVariables: ExperimentVariable[] = [
  {
    key: "daily_irrigation",
    displayName: "Lượng nước tưới mỗi ngày",
    role: "INDEPENDENT",
    dataType: "NUMBER",
    unit: "mL/day",
    minValue: 0,
    maxValue: 1000,
    defaultValue: 250,
    sourceId: "FAO-56-water-balance",
  },
  {
    key: "plant_height",
    displayName: "Chiều cao cây",
    role: "DEPENDENT",
    dataType: "NUMBER",
    unit: "cm",
    minValue: 0,
    maxValue: 200,
    defaultValue: 20,
    sourceId: "plant-concept-model-card-v0.1",
  },
  {
    key: "air_temperature",
    displayName: "Nhiệt độ không khí",
    role: "CONTROLLED",
    dataType: "NUMBER",
    unit: "°C",
    minValue: 5,
    maxValue: 40,
    defaultValue: 22,
    sourceId: "plant-concept-model-card-v0.1",
  },
];

const robotVariables: ExperimentVariable[] = [
  {
    key: "motor_power",
    displayName: "Công suất động cơ",
    role: "INDEPENDENT",
    dataType: "NUMBER",
    unit: "%",
    minValue: 0,
    maxValue: 100,
    defaultValue: 60,
    sourceId: "robot-kinematics-model-card-v0.1",
  },
  {
    key: "travel_time",
    displayName: "Thời gian hoàn thành đường đi",
    role: "DEPENDENT",
    dataType: "NUMBER",
    unit: "s",
    minValue: 0,
    maxValue: 300,
    defaultValue: 30,
    sourceId: "robot-kinematics-model-card-v0.1",
  },
  {
    key: "robot_mass",
    displayName: "Khối lượng robot",
    role: "CONTROLLED",
    dataType: "NUMBER",
    unit: "kg",
    minValue: 0.1,
    maxValue: 20,
    defaultValue: 2,
    sourceId: "robot-kinematics-model-card-v0.1",
  },
];

const templateFor = (lab: Lab): ExperimentDefinition => {
  const workflow = buildWorkflow();
  const isPlant = lab.labType === "PLANT";
  return {
    domain: isPlant ? "PLANT" : "ROBOT",
    inquiryLevel: "GUIDED",
    workflowSchemaVersion: 1,
    modelVersion: isPlant ? "plant-concept-peony-0.1.0" : "robot-kinematics-0.1.0",
    learningObjectives: [
      isPlant
        ? "Thiết kế thí nghiệm một biến để giải thích ảnh hưởng của lượng nước tưới đến sinh trưởng của cây."
        : "Thiết kế thí nghiệm một biến để giải thích ảnh hưởng của công suất động cơ đến chuyển động của robot.",
      "Thu thập dữ liệu, biểu diễn kết quả và xây dựng kết luận theo Claim–Evidence–Reasoning (CER).",
    ],
    config: isPlant
      ? {
          species: "Paeonia lactiflora",
          common_name: "Hoa mẫu đơn",
          fidelity: "CONCEPT",
          model_disclaimer: "Mô hình khái niệm phục vụ học tập; chưa dùng để dự báo canh tác thực tế.",
          source_links: ["https://www.fao.org/4/x0490e/x0490e00.htm"],
        }
      : {
          robot_type: "differential_drive",
          fidelity: "CONCEPT",
          model_disclaimer: "Mô hình động học khái niệm; chưa mô phỏng đầy đủ ma sát và sai số cảm biến.",
          source_links: ["https://docs.ros.org/en/rolling/index.html"],
        },
    nodes: workflow.nodes,
    edges: workflow.edges,
    variables: isPlant ? plantVariables : robotVariables,
  };
};

const statusStyle: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  VALIDATED: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  PUBLISHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  SUPERSEDED: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
};

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Có lỗi không xác định";

export default function StemExperimentSetup({ lab, onPublished }: Props) {
  const [versions, setVersions] = useState<LabVersion[]>([]);
  const [definition, setDefinition] = useState<ExperimentDefinition>(() => templateFor(lab));
  const [objectiveText, setObjectiveText] = useState("");
  const [issues, setIssues] = useState<LabValidationIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"save" | "validate" | "publish" | null>(null);

  const latest = versions[0];
  const isPlant = lab.labType === "PLANT";
  const roleCoverage = useMemo(() => new Set(definition.variables.map(variable => variable.role)), [definition.variables]);

  const applyDefinition = (next: ExperimentDefinition) => {
    setDefinition(next);
    setObjectiveText(next.learningObjectives.join("\n"));
  };

  const loadVersions = async (preferTemplate = false) => {
    setLoading(true);
    try {
      const response = await labService.listLabVersions(lab.id);
      const nextVersions = response.data || [];
      setVersions(nextVersions);
      if (!preferTemplate && nextVersions[0]) {
        applyDefinition(nextVersions[0].definition);
      } else if (!nextVersions[0]) {
        applyDefinition(templateFor(lab));
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [lab.id]);

  const normalizedDefinition = (): ExperimentDefinition => ({
    ...definition,
    learningObjectives: objectiveText.split("\n").map(value => value.trim()).filter(Boolean),
  });

  const saveVersion = async () => {
    setAction("save");
    setIssues([]);
    try {
      const response = await labService.createLabVersion(lab.id, normalizedDefinition());
      toast.success(`Đã lưu phiên bản v${response.data.versionNumber}.`);
      await loadVersions();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAction(null);
    }
  };

  const validateVersion = async () => {
    if (!latest || latest.status !== "DRAFT") return;
    setAction("validate");
    try {
      const response = await labService.validateLabVersion(latest.id);
      setIssues(response.data.issues || []);
      if (response.data.valid) {
        toast.success(`Phiên bản v${latest.versionNumber} đã đạt kiểm tra và sẵn sàng publish.`);
        await loadVersions();
      } else {
        toast.error("Phiên bản còn lỗi cần sửa. Hãy tạo phiên bản mới sau khi chỉnh.");
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAction(null);
    }
  };

  const publishVersion = async () => {
    if (!latest || latest.status !== "VALIDATED") return;
    setAction("publish");
    try {
      await labService.publishLabVersion(latest.id);
      toast.success(`Đã publish lab với phiên bản v${latest.versionNumber}.`);
      await loadVersions();
      await onPublished?.();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAction(null);
    }
  };

  const updateVariable = (index: number, patch: Partial<ExperimentVariable>) => {
    setDefinition(current => ({
      ...current,
      variables: current.variables.map((variable, variableIndex) =>
        variableIndex === index ? { ...variable, ...patch } : variable
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900/60 dark:bg-slate-900">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 dark:from-emerald-950/30 dark:to-cyan-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-600 p-3 text-white">
              {isPlant ? <Leaf className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thiết kế thí nghiệm STEM</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Học sinh sẽ đi qua đầy đủ chu trình: dự đoán → thiết lập biến → chạy → đo → phân tích → giải thích → thử lại.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {latest && (
              <>
                <span className="text-sm font-semibold text-slate-500">v{latest.versionNumber}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[latest.status]}`}>
                  {latest.status}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 border-t border-emerald-100 p-5 dark:border-emerald-900/50 md:grid-cols-3">
          <div className="flex gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <Beaker className="mt-0.5 h-5 w-5 text-blue-600" />
            <div><p className="text-sm font-bold">1. Lưu phiên bản</p><p className="mt-1 text-xs text-slate-500">Chụp lại cấu hình bất biến để truy vết.</p></div>
          </div>
          <div className="flex gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <FileCheck2 className="mt-0.5 h-5 w-5 text-amber-600" />
            <div><p className="text-sm font-bold">2. Kiểm tra</p><p className="mt-1 text-xs text-slate-500">Rà mục tiêu, biến, workflow và bằng chứng.</p></div>
          </div>
          <div className="flex gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <Rocket className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div><p className="text-sm font-bold">3. Publish</p><p className="mt-1 text-xs text-slate-500">Chỉ bản đã vượt kiểm tra mới được phát hành.</p></div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Mục tiêu và mức độ khám phá</h3>
            <p className="mt-1 text-xs text-slate-500">Mỗi dòng là một mục tiêu học tập có thể quan sát hoặc đánh giá.</p>
          </div>
          <select
            value={definition.inquiryLevel}
            onChange={event => setDefinition(current => ({ ...current, inquiryLevel: event.target.value as InquiryLevel }))}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="STRUCTURED">Có hướng dẫn</option>
            <option value="GUIDED">Khám phá có định hướng</option>
            <option value="OPEN_INQUIRY">Khám phá mở</option>
          </select>
        </div>
        <textarea
          rows={4}
          value={objectiveText}
          onChange={event => setObjectiveText(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Model version
            <input
              value={definition.modelVersion}
              onChange={event => setDefinition(current => ({ ...current, modelVersion: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm font-normal dark:border-slate-700 dark:bg-slate-800"
            />
          </label>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <strong>Độ trung thực: CONCEPT.</strong> Template này phù hợp dạy phương pháp khoa học, chưa phải mô hình dự báo sinh học/kỹ thuật đã hiệu chuẩn. Mỗi lần đổi công thức phải tăng model version.
          </div>
        </div>
        <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          {isPlant ? "Loài cây mô phỏng (tên khoa học)" : "Kiểu robot mô phỏng"}
          <input
            value={String(isPlant ? definition.config.species || "" : definition.config.robot_type || "")}
            onChange={event => setDefinition(current => ({
              ...current,
              config: {
                ...current.config,
                [isPlant ? "species" : "robot_type"]: event.target.value,
              },
            }))}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm font-normal dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Biến thí nghiệm</h3>
            <p className="mt-1 text-xs text-slate-500">Cần ít nhất một biến độc lập, một biến phụ thuộc và một biến kiểm soát.</p>
          </div>
          <div className="flex gap-2 text-xs">
            {["INDEPENDENT", "DEPENDENT", "CONTROLLED"].map(role => (
              <span key={role} className={`rounded-full px-2.5 py-1 font-semibold ${roleCoverage.has(role as ExperimentVariable["role"]) ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
                {roleCoverage.has(role as ExperimentVariable["role"]) ? "✓" : "!"} {role}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {definition.variables.map((variable, index) => (
            <div key={variable.key} className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 lg:grid-cols-12">
              <label className="space-y-1 text-xs font-semibold lg:col-span-3">Tên hiển thị
                <input value={variable.displayName} onChange={event => updateVariable(index, { displayName: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="space-y-1 text-xs font-semibold lg:col-span-2">Vai trò
                <select value={variable.role} onChange={event => updateVariable(index, { role: event.target.value as ExperimentVariable["role"] })} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800">
                  <option value="INDEPENDENT">Độc lập</option><option value="DEPENDENT">Phụ thuộc</option><option value="CONTROLLED">Kiểm soát</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-semibold lg:col-span-1">Đơn vị
                <input value={variable.unit} onChange={event => updateVariable(index, { unit: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="space-y-1 text-xs font-semibold lg:col-span-1">Min
                <input type="number" value={variable.minValue ?? ""} onChange={event => updateVariable(index, { minValue: Number(event.target.value) })} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="space-y-1 text-xs font-semibold lg:col-span-1">Max
                <input type="number" value={variable.maxValue ?? ""} onChange={event => updateVariable(index, { maxValue: Number(event.target.value) })} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="space-y-1 text-xs font-semibold lg:col-span-1">Mặc định
                <input type="number" value={variable.defaultValue ?? ""} onChange={event => updateVariable(index, { defaultValue: Number(event.target.value) })} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="space-y-1 text-xs font-semibold lg:col-span-3">Nguồn / model card
                <input value={variable.sourceId} onChange={event => updateVariable(index, { sourceId: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs font-normal dark:border-slate-700 dark:bg-slate-800" />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Quy trình học sinh phải thực hiện</h3>
        </div>
        <div className="grid gap-2 md:grid-cols-4">
          {[...definition.nodes].sort((a, b) => a.orderHint - b.orderHint).map((node, index) => (
            <div key={node.key} className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
              <div className="mb-2 flex items-center justify-between"><span className="text-xs font-extrabold text-blue-600">{index + 1}. {node.type}</span>{index < definition.nodes.length - 1 && <ChevronRight className="hidden h-4 w-4 text-slate-400 md:block" />}</div>
              <p className="text-sm font-semibold">{node.title}</p>
              <p className="mt-1 text-[11px] text-slate-500">{node.requiredEvidence.length ? `Bằng chứng: ${node.requiredEvidence.join(", ")}` : "Không yêu cầu nộp bằng chứng"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm leading-6 text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">Căn cứ khoa học đang gắn với template</p>
            <p>Mô hình giữ rõ phiên bản, đơn vị đo, khoảng giá trị, nguồn của từng biến và cảnh báo độ trung thực. Nguồn nền đang gắn với template:</p>
            <a href={isPlant ? "https://www.fao.org/4/x0490e/x0490e00.htm" : "https://docs.ros.org/en/rolling/index.html"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline dark:text-blue-300">
              {isPlant ? "FAO Irrigation and Drainage Paper 56" : "ROS 2 documentation"} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {issues.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200"><AlertTriangle className="h-5 w-5" /> Kết quả kiểm tra</h3>
          <div className="space-y-2">
            {issues.map((issue, index) => (
              <div key={`${issue.code}-${index}`} className="rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-slate-900/50">
                <span className={issue.severity === "ERROR" ? "font-bold text-red-600" : "font-bold text-amber-700"}>{issue.severity}</span>
                <span className="mx-2 font-mono text-xs text-slate-500">{issue.path}</span>
                <span>{issue.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          {latest ? `Bản gần nhất: v${latest.versionNumber} · ${latest.status}` : "Chưa có phiên bản thí nghiệm"}
          {latest?.status === "PUBLISHED" && " · Chỉnh sửa rồi lưu sẽ tạo một phiên bản DRAFT mới."}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={saveVersion} disabled={action !== null} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-slate-700">
            {action === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Lưu phiên bản mới
          </button>
          <button onClick={validateVersion} disabled={action !== null || !latest || latest.status !== "DRAFT"} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {action === "validate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />} Kiểm tra bản DRAFT
          </button>
          <button onClick={publishVersion} disabled={action !== null || !latest || latest.status !== "VALIDATED"} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {action === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Publish
          </button>
        </div>
      </section>
    </div>
  );
}
