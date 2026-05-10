"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { LlmCatalogue, LlmTestCallResponse } from "@/services/llmConfigService";
import { llmConfigService } from "@/services/llmConfigService";

export function TestCallPanel({ catalogue }: { catalogue: LlmCatalogue | null }) {
  const [task, setTask] = useState<string>("chat");
  const [modelHint, setModelHint] = useState("");
  const [prompt, setPrompt] = useState("Nói 'xin chào' bằng tiếng Việt.");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<LlmTestCallResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await llmConfigService.testCall({
        task,
        model_hint: modelHint || undefined,
        prompt,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sanity test</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gọi gateway với task đã chọn và quan sát model nào được chọn, có fallback không, latency bao nhiêu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Task</Label>
          <Select value={task} onValueChange={setTask}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(catalogue?.task_codes ?? []).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Model hint (tuỳ chọn)</Label>
          <Input
            value={modelHint}
            onChange={(e) => setModelHint(e.target.value)}
            placeholder="llama-3.1-8b-instant"
          />
        </div>
        <div className="col-span-2">
          <Label>Prompt</Label>
          <Textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
      </div>

      <Button onClick={run} disabled={running || !prompt}>
        {running ? "Đang chạy…" : "Chạy test"}
      </Button>

      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-900/20 p-4 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Provider: <code className="font-mono">{result.provider}</code></span>
            <span>Model: <code className="font-mono">{result.model}</code></span>
            <span>Attempt: {result.attempt_no}</span>
            <span>Latency: {result.latency_ms} ms</span>
            <span>
              Tokens: {result.usage.prompt_tokens} in / {result.usage.completion_tokens} out
            </span>
            {result.fallback_used && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">fallback</span>
            )}
          </div>
          <pre className="whitespace-pre-wrap rounded bg-slate-50 dark:bg-slate-950 p-3 text-sm">
            {result.content}
          </pre>
        </div>
      )}
    </div>
  );
}