"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { LlmModel, LlmProvider } from "@/services/llmConfigService";
import { llmConfigService } from "@/services/llmConfigService";

type Props = {
  models: LlmModel[];
  providers: LlmProvider[];
  onChanged: () => void;
};

export function ModelsPanel({ models, providers, onChanged }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Models</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mỗi provider có nhiều model. Context window, giá token và default temperature đều chỉnh được live.
          </p>
        </div>
        <ModelDialog providers={providers} onSaved={onChanged} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-right">Context</th>
              <th className="px-4 py-3 text-left">Capabilities</th>
              <th className="px-4 py-3 text-right">In / Out (/1K)</th>
              <th className="px-4 py-3 text-center">Bật</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {models.map((m) => (
              <ModelRow key={m.id} model={m} providers={providers} onChanged={onChanged} />
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Chưa có model nào. Nhấn <span className="font-medium text-blue-600">+ Thêm model</span> để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModelRow({
  model, providers, onChanged,
}: {
  model: LlmModel;
  providers: LlmProvider[];
  onChanged: () => void;
}) {
  const [busy,      setBusy]      = useState(false);
  const [open,      setOpen]      = useState(false);
  const [isEnabled, setIsEnabled] = useState(model.enabled);

  const toggle = async () => {
    const next = !isEnabled;
    setIsEnabled(next);
    setBusy(true);
    try { await llmConfigService.updateModel(model.id, { enabled: next }); onChanged(); }
    catch { setIsEnabled(!next); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(`Xoá model "${model.model_name}"? Các binding tới model này sẽ bị xoá.`)) return;
    setBusy(true);
    try { await llmConfigService.deleteModel(model.id); onChanged(); }
    finally { setBusy(false); }
  };

  const caps: { label: string; color: string }[] = [
    ...(model.supports_tools     ? [{ label: "tools",   color: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400" }] : []),
    ...(model.supports_json      ? [{ label: "json",    color: "bg-blue-100   dark:bg-blue-950/40   text-blue-700   dark:text-blue-400"   }] : []),
    ...(model.supports_streaming ? [{ label: "stream",  color: "bg-cyan-100   dark:bg-cyan-950/40   text-cyan-700   dark:text-cyan-400"   }] : []),
    ...(model.supports_vision    ? [{ label: "vision",  color: "bg-amber-100  dark:bg-amber-950/40  text-amber-700  dark:text-amber-400"  }] : []),
  ];

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
      <td className="px-4 py-3">
        <code className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-300">
          {model.provider_code}
        </code>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800 dark:text-slate-200">
          {model.display_name || model.model_name}
        </div>
        {model.display_name && (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{model.model_name}</div>
        )}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
        {(model.context_window / 1000).toFixed(0)}K
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {caps.map((c) => (
            <span key={c.label} className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${c.color}`}>
              {c.label}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-xs tabular-nums text-slate-600 dark:text-slate-400">
        ${model.input_cost_per_1k.toFixed(5)} / ${model.output_cost_per_1k.toFixed(5)}
      </td>
      <td className="px-4 py-3 text-center">
        <Switch checked={isEnabled} onCheckedChange={toggle} disabled={busy} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 active:scale-95 transition-all duration-200">
                <Pencil className="h-3.5 w-3.5" /> Sửa
              </Button>
            </DialogTrigger>
            <ModelDialogContent
              model={model} providers={providers}
              onSaved={() => { setOpen(false); onChanged(); }}
            />
          </Dialog>
          <Button variant="destructive" size="sm"
            className="gap-1.5 active:scale-95 transition-all duration-200"
            onClick={remove} disabled={busy}
          >
            <Trash2 className="h-3.5 w-3.5" /> Xoá
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ModelDialog({ providers, onSaved }: { providers: LlmProvider[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={providers.length === 0}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Thêm model
        </Button>
      </DialogTrigger>
      <ModelDialogContent providers={providers} onSaved={() => { setOpen(false); onSaved(); }} />
    </Dialog>
  );
}

function ModelDialogContent({
  model, providers, onSaved,
}: {
  model?: LlmModel;
  providers: LlmProvider[];
  onSaved: () => void;
}) {
  const [providerId,        setProviderId]        = useState<string>(model ? String(model.provider_id) : providers[0]?.id ? String(providers[0].id) : "");
  const [modelName,         setModelName]         = useState(model?.model_name         ?? "");
  const [displayName,       setDisplayName]       = useState(model?.display_name       ?? "");
  const [family,            setFamily]            = useState(model?.family             ?? "");
  const [contextWindow,     setContextWindow]     = useState(String(model?.context_window      ?? 8192));
  const [temperature,       setTemperature]       = useState(String(model?.default_temperature ?? 0.3));
  const [maxTokens,         setMaxTokens]         = useState(String(model?.default_max_tokens  ?? 1024));
  const [inCost,            setInCost]            = useState(String(model?.input_cost_per_1k   ?? 0));
  const [outCost,           setOutCost]           = useState(String(model?.output_cost_per_1k  ?? 0));
  const [supportsJson,      setSupportsJson]      = useState(model?.supports_json      ?? true);
  const [supportsTools,     setSupportsTools]     = useState(model?.supports_tools     ?? false);
  const [supportsStreaming, setSupportsStreaming] = useState(model?.supports_streaming ?? true);
  const [supportsVision,    setSupportsVision]    = useState(model?.supports_vision    ?? false);
  const [enabled,           setEnabled]           = useState(model?.enabled            ?? true);
  const [saving,            setSaving]            = useState(false);
  const [error,             setError]             = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (model) {
        await llmConfigService.updateModel(model.id, {
          model_name: modelName, display_name: displayName || null, family: family || null,
          context_window: Number(contextWindow),
          default_temperature: Number(temperature), default_max_tokens: Number(maxTokens),
          input_cost_per_1k: Number(inCost), output_cost_per_1k: Number(outCost),
          supports_json: supportsJson, supports_tools: supportsTools,
          supports_streaming: supportsStreaming, supports_vision: supportsVision, enabled,
        });
      } else {
        await llmConfigService.upsertModel({
          provider_id: Number(providerId), model_name: modelName,
          display_name: displayName || null, family: family || null,
          context_window: Number(contextWindow),
          default_temperature: Number(temperature), default_max_tokens: Number(maxTokens),
          input_cost_per_1k: Number(inCost), output_cost_per_1k: Number(outCost),
          supports_json: supportsJson, supports_tools: supportsTools,
          supports_streaming: supportsStreaming, supports_vision: supportsVision, enabled,
        });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  };

  const inputCls = "rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200";

  const CapToggle = ({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">{label}</Label>
    </div>
  );

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {model ? "Sửa model" : "Thêm model"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-1">
        {/* Provider */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Provider</Label>
          <Select value={providerId} onValueChange={setProviderId} disabled={!!model}>
            <SelectTrigger className={`${inputCls} ${model ? "opacity-60" : ""}`}>
              <SelectValue placeholder="Chọn provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  <code className="font-mono text-xs">{p.code}</code>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model name */}
        <div className="space-y-1.5">
          <Label htmlFor="mod-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Model name <span className="text-rose-500">*</span>
          </Label>
          <Input id="mod-name" value={modelName} onChange={(e) => setModelName(e.target.value)}
            placeholder="llama-3.3-70b-versatile" className={`${inputCls} font-mono`} />
        </div>

        {/* Display name + Family */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mod-display" className="text-sm font-medium text-slate-700 dark:text-slate-300">Display name</Label>
            <Input id="mod-display" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Llama 3.3 70B" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mod-family" className="text-sm font-medium text-slate-700 dark:text-slate-300">Family</Label>
            <Input id="mod-family" value={family} onChange={(e) => setFamily(e.target.value)}
              placeholder="llama / claude / gemini" className={inputCls} />
          </div>
        </div>

        {/* Context / Temp / Max tokens */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mod-ctx" className="text-sm font-medium text-slate-700 dark:text-slate-300">Context window</Label>
            <Input id="mod-ctx" type="number" value={contextWindow} onChange={(e) => setContextWindow(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mod-temp" className="text-sm font-medium text-slate-700 dark:text-slate-300">Temperature</Label>
            <Input id="mod-temp" type="number" step="0.01" min="0" max="2" value={temperature}
              onChange={(e) => setTemperature(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mod-max" className="text-sm font-medium text-slate-700 dark:text-slate-300">Max tokens</Label>
            <Input id="mod-max" type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Costs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mod-in" className="text-sm font-medium text-slate-700 dark:text-slate-300">Input $/1K tokens</Label>
            <Input id="mod-in" type="number" step="0.00001" value={inCost}
              onChange={(e) => setInCost(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mod-out" className="text-sm font-medium text-slate-700 dark:text-slate-300">Output $/1K tokens</Label>
            <Input id="mod-out" type="number" step="0.00001" value={outCost}
              onChange={(e) => setOutCost(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Capabilities */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Capabilities</p>
          <div className="grid grid-cols-2 gap-3">
            <CapToggle id="cap-json"     checked={supportsJson}      onChange={setSupportsJson}      label="supports_json" />
            <CapToggle id="cap-tools"    checked={supportsTools}     onChange={setSupportsTools}     label="supports_tools" />
            <CapToggle id="cap-stream"   checked={supportsStreaming}  onChange={setSupportsStreaming}  label="supports_streaming" />
            <CapToggle id="cap-vision"   checked={supportsVision}    onChange={setSupportsVision}    label="supports_vision" />
          </div>
        </div>

        {/* Enabled */}
        <div className="flex items-center gap-3">
          <Switch id="mod-enabled" checked={enabled} onCheckedChange={setEnabled} />
          <Label htmlFor="mod-enabled" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Bật model</Label>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={save}
          disabled={saving || !modelName || !providerId}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50"
        >
          {saving ? "Đang lưu…" : "Lưu"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}