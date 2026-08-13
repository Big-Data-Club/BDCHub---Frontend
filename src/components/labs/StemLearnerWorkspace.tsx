"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Leaf,
  Loader2,
  Play,
  RefreshCw,
  Save,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { labService } from "@/services/labService";
import type {
  EvidenceEvent,
  ExperimentDefinition,
  ExperimentRun,
  ExperimentTrial,
  Lab,
  LabVersion,
  StemTrialResult,
  WorkflowNode,
} from "@/types";
import StemSimulationStage from "@/components/labs/StemSimulationStage";

type Props = { lab: Lab };
const ENGINE_VERSION = "stem-concept-web-0.1.0";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Có lỗi không xác định";
const eventID = () => crypto.randomUUID();
const round = (value: number, digits = 2) => Number(value.toFixed(digits));

const seededRandom = (seed: number) => {
  let state = Math.abs(Math.trunc(seed)) % 2147483647;
  if (state === 0) state = 1;
  return () => {
    state = state * 16807 % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const simulate = (
  definition: ExperimentDefinition,
  trial: ExperimentTrial,
): StemTrialResult => {
  const random = seededRandom(trial.seed);
  const independent = definition.variables.find(variable => variable.role === "INDEPENDENT")!;
  const dependent = definition.variables.find(variable => variable.role === "DEPENDENT")!;
  const controlled = definition.variables.find(variable => variable.role === "CONTROLLED")!;
  const config = trial.configSnapshot as Record<string, number>;
  const independentValue = Number(config[independent.key] ?? independent.defaultValue ?? 0);
  const controlledValue = Number(config[controlled.key] ?? controlled.defaultValue ?? 0);
  const independentSpan = Math.max(1, Number(independent.maxValue ?? 100) - Number(independent.minValue ?? 0));
  const controlledSpan = Math.max(1, Number(controlled.maxValue ?? 100) - Number(controlled.minValue ?? 0));
  const normalizedInput = (independentValue - Number(independent.minValue ?? 0)) / independentSpan;
  const normalizedControl = (controlledValue - Number(controlled.minValue ?? 0)) / controlledSpan;

  if (definition.domain === "PLANT") {
    const waterResponse = Math.max(0.03, 1 - 3.2 * Math.pow(normalizedInput - 0.55, 2));
    const environmentResponse = Math.max(0.35, 1 - 1.4 * Math.pow(normalizedControl - 0.5, 2));
    const depMin = Number(dependent.minValue ?? 0);
    const depSpan = Math.max(1, Number(dependent.maxValue ?? 40) - depMin);
    const points = Array.from({ length: 15 }, (_, day) => {
      const noise = (random() - 0.5) * depSpan * 0.012;
      const growth = depSpan * 0.36 * waterResponse * environmentResponse * (1 - Math.exp(-day / 5));
      return { x: day, y: round(Math.max(depMin, depMin + growth + (day === 0 ? 0 : noise))) };
    });
    return {
      trialId: trial.id,
      trialNumber: trial.trialNumber,
      seed: trial.seed,
      engineVersion: ENGINE_VERSION,
      domain: "PLANT",
      xLabel: "Ngày mô phỏng",
      yLabel: `${dependent.displayName} (${dependent.unit})`,
      points,
      summary: `${dependent.displayName} cuối kỳ: ${points[points.length - 1].y} ${dependent.unit}.`,
      config,
    };
  }

  const power = Math.max(0.04, normalizedInput);
  const massFactor = 0.75 + normalizedControl * 0.65;
  const depMin = Number(dependent.minValue ?? 0);
  const depMax = Number(dependent.maxValue ?? 300);
  const finishTime = Math.min(depMax, Math.max(depMin, (8 + 22 / power) * massFactor * (0.98 + random() * 0.04)));
  const points = Array.from({ length: 11 }, (_, index) => ({
    x: round(index * finishTime / 10),
    y: round(index * 10),
  }));
  return {
    trialId: trial.id,
    trialNumber: trial.trialNumber,
    seed: trial.seed,
    engineVersion: ENGINE_VERSION,
    domain: "ROBOT",
    xLabel: "Thời gian (s)",
    yLabel: "Tiến độ quãng đường (%)",
    points,
    summary: `Robot hoàn thành quãng đường trong ${round(finishTime)} ${dependent.unit || "s"}.`,
    config,
  };
};

const nodeIcon = (type: string) => {
  if (type === "RUN") return Play;
  if (type === "CONFIGURE") return SlidersHorizontal;
  if (type === "ANALYZE") return BarChart3;
  if (type === "REFLECT") return ClipboardCheck;
  return FlaskConical;
};

export default function StemLearnerWorkspace({ lab }: Props) {
  const [version, setVersion] = useState<LabVersion | null>(null);
  const [run, setRun] = useState<ExperimentRun | null>(null);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [activeNodeKey, setActiveNodeKey] = useState("");
  const [config, setConfig] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [claim, setClaim] = useState("");
  const [cerEvidence, setCerEvidence] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [iterationReason, setIterationReason] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const orderedNodes = useMemo(
    () => [...(version?.definition.nodes || [])].sort((a, b) => a.orderHint - b.orderHint),
    [version],
  );
  const completedNodes = useMemo(
    () => new Set(events.map(event => String(event.context.workflow_node || "")).filter(Boolean)),
    [events],
  );
  const trialResults = useMemo(
    () => events
      .filter(event => event.object.type === "simulation_run")
      .map(event => event.result as StemTrialResult)
      .filter(result => Array.isArray(result.points)),
    [events],
  );
  const latestResult = trialResults[trialResults.length - 1];
  const activeNode = orderedNodes.find(node => node.key === activeNodeKey) || orderedNodes[0];

  const refreshEvents = async (runId: number) => {
    const response = await labService.getExperimentEvidence(runId);
    const nextEvents = response.data || [];
    setEvents(nextEvents);
    const latestSimulation = [...nextEvents].reverse().find(event => event.object.type === "simulation_run");
    const latestConfig = latestSimulation?.result?.config;
    if (latestConfig && typeof latestConfig === "object") {
      setConfig(latestConfig as Record<string, number>);
    }
    nextEvents.forEach(event => {
      if (event.object.type === "prediction") setPrediction(String(event.result.text || ""));
      if (event.object.type === "chart_and_interpretation") setAnalysis(String(event.result.interpretation || ""));
      if (event.object.type === "claim_evidence_reasoning") {
        setClaim(String(event.result.claim || ""));
        setCerEvidence(String(event.result.evidence || ""));
        setReasoning(String(event.result.reasoning || ""));
      }
      if (event.object.type === "change_reason") setIterationReason(String(event.result.reason || ""));
      if (event.object.type === "reflection") setReflection(String(event.result.text || ""));
    });
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const versionResponse = await labService.getPublishedLabVersion(lab.id);
        const published = versionResponse.data;
        setVersion(published);
        const defaults: Record<string, number> = {};
        published.definition.variables.forEach(variable => {
          defaults[variable.key] = Number(variable.defaultValue ?? variable.minValue ?? 0);
        });
        setConfig(defaults);
        setActiveNodeKey([...published.definition.nodes].sort((a, b) => a.orderHint - b.orderHint)[0]?.key || "");

        const storedRunId = localStorage.getItem(`stem-run-id-${published.id}`);
        if (storedRunId) {
          try {
            const runResponse = await labService.getExperimentRun(Number(storedRunId));
            if (runResponse.data.labVersionId === published.id) {
              setRun(runResponse.data);
              if (runResponse.data.currentNodeKey) setActiveNodeKey(runResponse.data.currentNodeKey);
              await refreshEvents(runResponse.data.id);
            }
          } catch {
            localStorage.removeItem(`stem-run-id-${published.id}`);
          }
        }
      } catch (error) {
        toast.error(errorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [lab.id]);

  const startRun = async () => {
    if (!version) return;
    setBusy(true);
    try {
      const keyName = `stem-run-key-${version.id}`;
      let key = localStorage.getItem(keyName);
      if (!key) {
        key = `stem-${version.id}-${eventID()}`;
        localStorage.setItem(keyName, key);
      }
      const response = await labService.createExperimentRun(version.id, key);
      setRun(response.data);
      localStorage.setItem(`stem-run-id-${version.id}`, String(response.data.id));
      await refreshEvents(response.data.id);
      toast.success("Đã bắt đầu bài thực hành. Tiến trình sẽ được tự động lưu.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const append = async (
    node: WorkflowNode,
    verb: string,
    objectType: string,
    result: Record<string, any>,
    trialId?: number,
  ) => {
    if (!run || run.status !== "ACTIVE") return;
    await labService.appendExperimentEvidence(run.id, {
      clientEventId: eventID(),
      trialId,
      workflowNodeKey: node.key,
      verb,
      object: { type: objectType, id: `${objectType}-${Date.now()}` },
      result,
      context: {
        model_version: version?.definition.modelVersion,
        engine_version: ENGINE_VERSION,
      },
    });
    await refreshEvents(run.id);
  };

  const nextNode = (node: WorkflowNode) => {
    const index = orderedNodes.findIndex(item => item.key === node.key);
    if (index >= 0 && orderedNodes[index + 1]) setActiveNodeKey(orderedNodes[index + 1].key);
  };

  const saveTextEvidence = async (
    node: WorkflowNode,
    verb: string,
    objectType: string,
    result: Record<string, any>,
    trialId?: number,
  ) => {
    setBusy(true);
    try {
      await append(node, verb, objectType, result, trialId);
      nextNode(node);
      toast.success("Đã lưu bằng chứng vào tiến trình học tập.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const runTrial = async (node: WorkflowNode, iteration = false) => {
    if (!run || !version) return;
    setBusy(true);
    try {
      const trialResponse = await labService.createExperimentTrial(run.id, config);
      const result = simulate(version.definition, trialResponse.data);
      if (iteration) {
        await append(node, "iterated", node.requiredEvidence[0] || "change_reason", {
          reason: iterationReason,
          changed_config: config,
          new_trial_number: trialResponse.data.trialNumber,
        }, trialResponse.data.id);
      }
      const runNode = orderedNodes.find(item => item.type === "RUN") || node;
      await append(runNode, "started_trial", "simulation_run", result, trialResponse.data.id);
      setActiveNodeKey((orderedNodes.find(item => item.type === "MEASURE") || runNode).key);
      toast.success(`Đã chạy lần thử ${trialResponse.data.trialNumber} với seed ${trialResponse.data.seed}.`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const complete = async (node: WorkflowNode) => {
    if (!run) return;
    setBusy(true);
    try {
      await append(node, "reflected", node.requiredEvidence[0] || "reflection", { text: reflection });
      const response = await labService.completeExperimentRun(run.id);
      setRun(response.data);
      toast.success("Bạn đã hoàn thành bài thực hành STEM!");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const resetForNewAttempt = () => {
    if (!version) return;
    localStorage.removeItem(`stem-run-id-${version.id}`);
    localStorage.removeItem(`stem-run-key-${version.id}`);
    setRun(null);
    setEvents([]);
    setPrediction("");
    setAnalysis("");
    setClaim("");
    setCerEvidence("");
    setReasoning("");
    setIterationReason("");
    setReflection("");
    const defaults: Record<string, number> = {};
    version.definition.variables.forEach(variable => {
      defaults[variable.key] = Number(variable.defaultValue ?? variable.minValue ?? 0);
    });
    setConfig(defaults);
    setActiveNodeKey(orderedNodes[0]?.key || "");
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>;
  }

  if (!version) {
    return <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-400">Không tìm thấy phiên bản thí nghiệm đã publish hoặc bạn chưa đăng ký lab.</div>;
  }

  if (!run) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className={`mb-5 rounded-3xl border p-5 ${lab.labType === "PLANT" ? "border-lime-800 bg-lime-950/40" : "border-cyan-800 bg-cyan-950/40"}`}>
          {lab.labType === "PLANT" ? <Leaf className="h-12 w-12 text-lime-400" /> : <Bot className="h-12 w-12 text-cyan-400" />}
        </div>
        <h3 className="text-xl font-bold">Sẵn sàng bắt đầu thí nghiệm?</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">Phiên bản v{version.versionNumber} · {version.definition.modelVersion}. Mọi dự đoán, lần thử, dữ liệu và kết luận sẽ được lưu để giáo viên xem tiến trình.</p>
        <button onClick={startRun} disabled={busy} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Bắt đầu thực hành
        </button>
      </div>
    );
  }

  const renderResult = () => {
    if (!latestResult) return <p className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">Hãy chạy mô phỏng trước để có dữ liệu.</p>;
    const maxY = Math.max(...latestResult.points.map(point => point.y), 1);
    return (
      <div className="space-y-4">
        <StemSimulationStage
          definition={version.definition}
          result={latestResult}
          comparison={trialResults.length > 1 ? trialResults[trialResults.length - 2] : undefined}
        />
        <div className="rounded-xl border border-emerald-900 bg-emerald-950/20 p-4">
          <p className="font-bold text-emerald-300">Lần thử {latestResult.trialNumber}: {latestResult.summary}</p>
          <p className="mt-1 font-mono text-[11px] text-slate-500">seed={latestResult.seed} · engine={latestResult.engineVersion}</p>
        </div>
        <div className="flex h-44 items-end gap-1 rounded-xl border border-slate-700 bg-slate-950 p-4">
          {latestResult.points.map(point => (
            <div key={point.x} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${latestResult.xLabel}: ${point.x}; ${latestResult.yLabel}: ${point.y}`}>
              <span className="hidden text-[9px] text-slate-300 group-hover:block">{point.y}</span>
              <div className="w-full rounded-t bg-emerald-500/80" style={{ height: `${Math.max(3, point.y / maxY * 115)}px` }} />
              <span className="text-[8px] text-slate-500">{point.x}</span>
            </div>
          ))}
        </div>
        <div className="max-h-40 overflow-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-xs"><thead className="sticky top-0 bg-slate-800"><tr><th className="p-2">{latestResult.xLabel}</th><th className="p-2">{latestResult.yLabel}</th></tr></thead><tbody>{latestResult.points.map(point => <tr key={point.x} className="border-t border-slate-800"><td className="p-2">{point.x}</td><td className="p-2">{point.y}</td></tr>)}</tbody></table>
        </div>
      </div>
    );
  };

  const content = () => {
    if (!activeNode) return null;
    const requiredType = activeNode.requiredEvidence[0];
    switch (activeNode.type) {
      case "PREDICTION":
        return <><textarea value={prediction} onChange={event => setPrediction(event.target.value)} rows={7} placeholder="Nếu thay đổi biến độc lập thì bạn dự đoán điều gì? Vì sao?" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" /><Action disabled={busy || !prediction.trim()} onClick={() => saveTextEvidence(activeNode, "predicted", requiredType || "prediction", { text: prediction })} label="Lưu dự đoán" /> </>;
      case "CONFIGURE":
        return <><VariableControls definition={version.definition} config={config} setConfig={setConfig} /><Action disabled={busy} onClick={() => saveTextEvidence(activeNode, "changed_variable", "experiment_configuration", { config })} label="Xác nhận cấu hình" /></>;
      case "RUN":
        return <><VariableControls definition={version.definition} config={config} setConfig={setConfig} /><Action disabled={busy} onClick={() => runTrial(activeNode)} label="Chạy mô phỏng" icon="play" /></>;
      case "MEASURE":
        return <>{renderResult()}<Action disabled={busy || !latestResult} onClick={() => saveTextEvidence(activeNode, "measured", requiredType || "measurement_table", { trial_result: latestResult }, latestResult?.trialId)} label="Lưu bảng đo" /></>;
      case "ANALYZE":
        return <>{renderResult()}<textarea value={analysis} onChange={event => setAnalysis(event.target.value)} rows={5} placeholder="Mô tả xu hướng, so sánh dữ liệu và nêu điểm bất thường..." className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" /><Action disabled={busy || !analysis.trim()} onClick={() => saveTextEvidence(activeNode, "analyzed", requiredType || "chart_and_interpretation", { interpretation: analysis, trial_count: trialResults.length })} label="Lưu phân tích" /></>;
      case "EXPLAIN":
        return <><TextField label="Claim – Kết luận" value={claim} setValue={setClaim} /><TextField label="Evidence – Bằng chứng số liệu" value={cerEvidence} setValue={setCerEvidence} /><TextField label="Reasoning – Giải thích khoa học" value={reasoning} setValue={setReasoning} /><Action disabled={busy || !claim.trim() || !cerEvidence.trim() || !reasoning.trim()} onClick={() => saveTextEvidence(activeNode, "explained", requiredType || "claim_evidence_reasoning", { claim, evidence: cerEvidence, reasoning })} label="Lưu CER" /></>;
      case "ITERATE":
        return <><p className="text-sm leading-6 text-slate-400">Thay đổi ít nhất một giá trị, giải thích lý do rồi chạy lần thử mới.</p><VariableControls definition={version.definition} config={config} setConfig={setConfig} /><textarea value={iterationReason} onChange={event => setIterationReason(event.target.value)} rows={4} placeholder="Tôi thay đổi... vì..." className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" /><Action disabled={busy || !iterationReason.trim()} onClick={() => runTrial(activeNode, true)} label="Lưu lý do và chạy lại" icon="refresh" /></>;
      case "REFLECT":
        return <><textarea value={reflection} onChange={event => setReflection(event.target.value)} rows={7} placeholder="Điều gì bạn học được? Kết quả có giới hạn gì? Nếu làm lại bạn sẽ cải thiện thế nào?" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" /><Action disabled={busy || !reflection.trim()} onClick={() => complete(activeNode)} label="Nộp và hoàn thành bài" icon="send" /></>;
      default:
        return <Action disabled={busy} onClick={() => saveTextEvidence(activeNode, "checkpoint_completed", "checkpoint", { completed: true })} label="Đã đọc và tiếp tục" />;
    }
  };

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-52 flex-shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950/50 p-3">
        <div className="mb-3 rounded-xl bg-slate-800 p-3 text-xs"><p className="font-bold text-slate-200">Tiến trình</p><p className="mt-1 text-slate-500">{completedNodes.size}/{orderedNodes.length} bước có dữ liệu</p></div>
        <div className="space-y-1.5">{orderedNodes.map((node, index) => {
          const Icon = nodeIcon(node.type);
          const done = completedNodes.has(node.key);
          return <button key={node.key} onClick={() => setActiveNodeKey(node.key)} className={`w-full rounded-xl p-2.5 text-left text-xs transition ${activeNode?.key === node.key ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}><div className="flex items-center gap-2">{done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Icon className="h-4 w-4" />}<span className="font-bold">{index + 1}. {node.title}</span></div></button>;
        })}</div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-emerald-400">{activeNode?.type}</p><h3 className="mt-1 text-xl font-bold">{activeNode?.title}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${run.status === "COMPLETED" ? "bg-emerald-950 text-emerald-300" : "bg-blue-950 text-blue-300"}`}>{run.status}</span></div>
          {run.status === "COMPLETED" ? <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" /><h3 className="mt-3 text-xl font-bold">Đã hoàn thành</h3><p className="mt-2 text-sm text-slate-400">Giáo viên có thể xem toàn bộ {events.length} bằng chứng và {trialResults.length} lần thử của bạn.</p><button type="button" onClick={resetForNewAttempt} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-950/60 px-4 py-2.5 text-sm font-bold text-emerald-200 hover:bg-emerald-900"><RefreshCw className="h-4 w-4" /> Làm lại bằng lượt mới</button></div> : content()}
          <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-3 text-xs leading-5 text-amber-200/80"><strong>Mô hình khái niệm:</strong> kết quả giúp học phương pháp thí nghiệm và có thể tái tạo bằng seed; không dùng để dự báo canh tác hoặc thiết kế robot ngoài đời.</div>
        </div>
      </main>
    </div>
  );
}

function VariableControls({ definition, config, setConfig }: { definition: ExperimentDefinition; config: Record<string, number>; setConfig: Dispatch<SetStateAction<Record<string, number>>> }) {
  return <div className="space-y-3">{definition.variables.filter(variable => variable.role !== "DEPENDENT").map(variable => <label key={variable.key} className="block rounded-xl border border-slate-700 bg-slate-950/40 p-4"><div className="mb-3 flex items-center justify-between gap-3"><span className="text-sm font-bold">{variable.displayName} <span className="text-xs font-normal text-slate-500">({variable.role})</span></span><span className="rounded-lg bg-slate-800 px-2 py-1 font-mono text-sm text-emerald-300">{config[variable.key]} {variable.unit}</span></div><input type="range" min={variable.minValue ?? 0} max={variable.maxValue ?? 100} step={variable.dataType === "INTEGER" ? 1 : Math.max(0.1, ((variable.maxValue ?? 100) - (variable.minValue ?? 0)) / 100)} value={config[variable.key] ?? 0} onChange={event => setConfig(current => ({ ...current, [variable.key]: Number(event.target.value) }))} className="w-full accent-emerald-500" /><div className="mt-1 flex justify-between text-[10px] text-slate-600"><span>{variable.minValue}</span><span>{variable.maxValue}</span></div></label>)}</div>;
}

function TextField({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) {
  return <label className="block space-y-2 text-sm font-bold text-slate-300">{label}<textarea value={value} onChange={event => setValue(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm font-normal text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" /></label>;
}

function Action({ label, onClick, disabled, icon }: { label: string; onClick: () => void; disabled?: boolean; icon?: "play" | "refresh" | "send" }) {
  const Icon = icon === "play" ? Play : icon === "refresh" ? RefreshCw : icon === "send" ? Send : Save;
  return <button onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"><Icon className="h-4 w-4" /> {label}</button>;
}
