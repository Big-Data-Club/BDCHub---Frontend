"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FlaskConical,
  Loader2,
  Mail,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { labService } from "@/services/labs/labService";
import type { EvidenceEvent, ExperimentRunSummary, Lab } from "@/types";
import { Select } from "@/components/lms/shared/Select";

type Props = { lab: Lab };

const objectLabels: Record<string, string> = {
  prediction: "Dự đoán",
  experiment_configuration: "Cấu hình biến",
  simulation_run: "Chạy mô phỏng",
  measurement_table: "Bảng đo",
  chart_and_interpretation: "Phân tích dữ liệu",
  claim_evidence_reasoning: "Kết luận CER",
  change_reason: "Lý do thử lại",
  reflection: "Phản tư",
  checkpoint: "Điểm kiểm tra",
};

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  ABANDONED: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const safeText = (value: unknown) => typeof value === "string" ? value : "";

function evidenceSummary(event: EvidenceEvent) {
  const result = event.result || {};
  if (event.object.type === "prediction" || event.object.type === "reflection") return safeText(result.text);
  if (event.object.type === "chart_and_interpretation") return safeText(result.interpretation);
  if (event.object.type === "change_reason") return safeText(result.reason);
  if (event.object.type === "claim_evidence_reasoning") {
    return `Claim: ${safeText(result.claim)}\nEvidence: ${safeText(result.evidence)}\nReasoning: ${safeText(result.reasoning)}`;
  }
  if (event.object.type === "simulation_run") {
    return `${safeText(result.summary)}\nSeed: ${String(result.seed ?? "-")} · Engine: ${safeText(result.engineVersion) || "-"}`;
  }
  if (event.object.type === "measurement_table") {
    const trialResult = result.trial_result as Record<string, unknown> | undefined;
    return trialResult ? `${safeText(trialResult.summary)} · ${Array.isArray(trialResult.points) ? trialResult.points.length : 0} điểm đo` : "Đã lưu bảng đo";
  }
  if (event.object.type === "experiment_configuration") {
    return Object.entries((result.config || {}) as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
  }
  return "Đã ghi nhận bằng chứng";
}

export default function StemLearnerProgress({ lab }: Props) {
  const [runs, setRuns] = useState<ExperimentRunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<ExperimentRunSummary | null>(null);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const response = await labService.listExperimentRuns(lab.id, filter);
      setRuns(response.items || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được tiến trình học viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lab.id, filter, loadRuns]);

  const openRun = async (run: ExperimentRunSummary) => {
    setSelectedRun(run);
    setEvents([]);
    setLoadingEvents(true);
    try {
      const response = await labService.getExperimentEvidence(run.id);
      setEvents(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được evidence timeline");
    } finally {
      setLoadingEvents(false);
    }
  };

  const completed = runs.filter(run => run.status === "COMPLETED").length;
  const active = runs.filter(run => run.status === "ACTIVE").length;
  const totalTrials = runs.reduce((sum, run) => sum + run.trialCount, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={UserRound} label="Lượt làm bài" value={runs.length} color="blue" />
        <Metric icon={CheckCircle2} label="Đã hoàn thành" value={completed} detail={`${active} đang thực hiện`} color="emerald" />
        <Metric icon={FlaskConical} label="Tổng lần thử" value={totalTrials} detail="Có seed và cấu hình" color="violet" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Activity className="h-5 w-5 text-blue-600" /> Tiến trình học viên</h2>
            <p className="mt-1 text-xs text-slate-500">Chọn một lượt làm để xem toàn bộ dự đoán, trial, số liệu và kết luận theo thứ tự thời gian.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              size="sm"
              value={filter}
              onValueChange={(val) => setFilter(val)}
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "ACTIVE", label: "Đang thực hiện" },
                { value: "COMPLETED", label: "Đã hoàn thành" },
                { value: "ABANDONED", label: "Đã bỏ dở" },
              ]}
              containerClassName="w-44"
            />
            <button type="button" onClick={loadRuns} className="rounded-xl border border-slate-300 p-2.5 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Làm mới danh sách">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>
        ) : runs.length === 0 ? (
          <div className="p-12 text-center"><UserRound className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Chưa có học viên bắt đầu lab</p><p className="mt-1 text-xs text-slate-400">Lượt làm sẽ xuất hiện ngay sau khi học viên bấm “Bắt đầu thực hành”.</p></div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {runs.map(run => (
              <button key={run.id} type="button" onClick={() => openRun(run)} className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 md:grid-cols-[1.4fr_.7fr_.7fr_.4fr_auto] md:items-center">
                <div><p className="font-bold text-slate-900 dark:text-white">{run.learnerName || `Học viên #${run.userId}`}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" /> {run.learnerEmail || "-"}</p></div>
                <div><p className="text-[10px] font-semibold uppercase text-slate-400">Bước hiện tại</p><p className="mt-1 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{run.currentNodeKey || "Chưa bắt đầu"}</p></div>
                <div><p className="text-[10px] font-semibold uppercase text-slate-400">Evidence / Trial</p><p className="mt-1 text-sm font-bold">{run.lastEventSeq} / {run.trialCount}</p></div>
                <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[run.status]}`}>{run.status}</span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedRun && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedRun(null)}>
          <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-900" onClick={event => event.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
              <div><p className="text-xs font-bold text-blue-600">RUN #{selectedRun.id} · LAB v{selectedRun.labVersionNumber}</p><h3 className="mt-1 text-xl font-bold">{selectedRun.learnerName || `Học viên #${selectedRun.userId}`}</h3><p className="mt-1 text-xs text-slate-500">{selectedRun.learnerEmail} · {selectedRun.trialCount} trial · {selectedRun.lastEventSeq} evidence</p></div>
              <button type="button" onClick={() => setSelectedRun(null)} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5">
              {loadingEvents ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div> : events.length === 0 ? <p className="py-20 text-center text-sm text-slate-500">Chưa có evidence.</p> : <div className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-slate-200 dark:before:bg-slate-700">{events.map(event => <article key={event.eventId} className="relative flex gap-4"><div className="z-[1] flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-xs font-black text-white dark:border-slate-900">{event.seqNo}</div><div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-bold text-slate-900 dark:text-white">{objectLabels[event.object.type] || event.object.type}</p><p className="mt-1 font-mono text-[10px] text-slate-500">{String(event.context.workflow_node || "-")} · {event.verb}</p></div><span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock3 className="h-3 w-3" /> {new Date(event.occurredAt).toLocaleString("vi-VN")}</span></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{evidenceSummary(event)}</p></div></article>)}</div>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, color }: { icon: typeof BarChart3; label: string; value: number; detail?: string; color: "blue" | "emerald" | "violet" }) {
  const colors = { blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30", emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30", violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/30" };
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className={`rounded-2xl p-3 ${colors[color]}`}><Icon className="h-6 w-6" /></div><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>{detail && <p className="text-[10px] text-slate-400">{detail}</p>}</div></div>;
}
