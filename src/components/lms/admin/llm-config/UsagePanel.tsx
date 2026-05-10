"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { LlmCatalogue, LlmUsageResponse } from "@/services/llmConfigService";
import { llmConfigService } from "@/services/llmConfigService";

export function UsagePanel({ catalogue }: { catalogue: LlmCatalogue | null }) {
  const [data, setData] = useState<LlmUsageResponse | null>(null);
  const [sinceHours, setSinceHours] = useState("24");
  const [taskCode, setTaskCode] = useState<string>("__all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await llmConfigService.getUsage(
        Number(sinceHours),
        taskCode === "__all" ? undefined : taskCode,
      );
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinceHours, taskCode]);

  const rows = data?.rows ?? [];
  const totals = rows.reduce(
    (acc, r) => {
      acc.calls += r.calls;
      acc.tokens += r.total_tokens;
      acc.failures += r.failures;
      acc.fallbacks += r.fallbacks;
      return acc;
    },
    { calls: 0, tokens: 0, failures: 0, fallbacks: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Usage</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tổng hợp số lời gọi, token, độ trễ trung bình trong cửa sổ thời gian.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <Label className="text-xs">Khoảng thời gian</Label>
            <Select value={sinceHours} onValueChange={setSinceHours}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 giờ</SelectItem>
                <SelectItem value="24">24 giờ</SelectItem>
                <SelectItem value="168">7 ngày</SelectItem>
                <SelectItem value="720">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Task</Label>
            <Select value={taskCode} onValueChange={setTaskCode}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Tất cả</SelectItem>
                {(catalogue?.task_codes ?? []).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            {loading ? "…" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="Calls"        value={totals.calls.toLocaleString()} />
        <Stat label="Total tokens" value={totals.tokens.toLocaleString()} />
        <Stat label="Failures"     value={totals.failures.toLocaleString()}
              tone={totals.failures > 0 ? "rose" : "slate"} />
        <Stat label="Fallbacks"    value={totals.fallbacks.toLocaleString()}
              tone={totals.fallbacks > 0 ? "amber" : "slate"} />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Provider</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Task</th>
              <th className="px-4 py-2 text-right">Calls</th>
              <th className="px-4 py-2 text-right">OK / Fail</th>
              <th className="px-4 py-2 text-right">Fallbacks</th>
              <th className="px-4 py-2 text-right">Tokens (in/out)</th>
              <th className="px-4 py-2 text-right">Avg latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                <td className="px-4 py-2 font-mono text-xs">{r.provider_code}</td>
                <td className="px-4 py-2 font-mono text-xs">{r.model_name}</td>
                <td className="px-4 py-2 font-mono text-xs">{r.task_code}</td>
                <td className="px-4 py-2 text-right tabular-nums">{r.calls.toLocaleString()}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  <span className="text-emerald-600">{r.successes}</span>
                  <span className="text-slate-300"> / </span>
                  <span className={r.failures > 0 ? "text-rose-600" : "text-slate-400"}>
                    {r.failures}
                  </span>
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{r.fallbacks}</td>
                <td className="px-4 py-2 text-right tabular-nums text-xs">
                  {r.prompt_tokens.toLocaleString()} / {r.completion_tokens.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{r.avg_latency_ms} ms</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  Chưa có dữ liệu usage.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label, value, tone = "slate",
}: {
  label: string;
  value: string;
  tone?: "slate" | "rose" | "amber";
}) {
  const toneClass =
    tone === "rose" ? "text-rose-600" : tone === "amber" ? "text-amber-600" : "text-slate-900 dark:text-slate-100";
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold ${toneClass} tabular-nums`}>{value}</p>
    </div>
  );
}