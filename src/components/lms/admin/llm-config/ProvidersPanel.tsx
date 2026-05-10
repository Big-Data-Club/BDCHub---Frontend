"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { LlmProvider, LlmCatalogue } from "@/services/llmConfigService";
import { llmConfigService } from "@/services/llmConfigService";

type Props = {
  providers: LlmProvider[];
  catalogue: LlmCatalogue | null;
  onChanged: () => void;
};

export function ProvidersPanel({ providers, catalogue, onChanged }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Providers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý các nhà cung cấp LLM (Groq, Anthropic, Gemini, Ollama…).
          </p>
        </div>
        <ProviderDialog catalogue={catalogue} onSaved={onChanged} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Tên hiển thị</th>
              <th className="px-4 py-3 text-left">Adapter</th>
              <th className="px-4 py-3 text-left">Base URL</th>
              <th className="px-4 py-3 text-center">Bật</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {providers.map((p) => (
              <ProviderRow key={p.id} provider={p} catalogue={catalogue} onChanged={onChanged} />
            ))}
            {providers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Chưa có provider nào. Nhấn <span className="font-medium text-blue-600">+ Thêm provider</span> để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProviderRow({
  provider, catalogue, onChanged,
}: {
  provider: LlmProvider;
  catalogue: LlmCatalogue | null;
  onChanged: () => void;
}) {
  const [busy,      setBusy]      = useState(false);
  const [open,      setOpen]      = useState(false);
  const [isEnabled, setIsEnabled] = useState(provider.enabled);

  const toggle = async () => {
    const next = !isEnabled;
    setIsEnabled(next);             // optimistic — instant visual
    setBusy(true);
    try {
      await llmConfigService.updateProvider(provider.id, { enabled: next });
      onChanged();
    } catch {
      setIsEnabled(!next);          // revert on error
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(`Xoá provider "${provider.code}"? Mọi model, key và binding liên quan sẽ bị xoá theo.`)) return;
    setBusy(true);
    try {
      await llmConfigService.deleteProvider(provider.id);
      onChanged();
    } finally { setBusy(false); }
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
      <td className="px-4 py-3">
        <code className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-300">
          {provider.code}
        </code>
      </td>
      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{provider.display_name}</td>
      <td className="px-4 py-3">
        <span className="rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-mono text-blue-700 dark:text-blue-400">
          {provider.adapter_type}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">
        {provider.base_url || <span className="text-slate-300 dark:text-slate-600">—</span>}
      </td>
      <td className="px-4 py-3 text-center">
        <Switch
          checked={isEnabled}
          onCheckedChange={toggle}
          disabled={busy}
          aria-label="Toggle provider"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 active:scale-95 transition-all duration-200">
                <Pencil className="h-3.5 w-3.5" /> Sửa
              </Button>
            </DialogTrigger>
            <ProviderDialogContent
              provider={provider}
              catalogue={catalogue}
              onSaved={() => { setOpen(false); onChanged(); }}
            />
          </Dialog>
          <Button
            variant="destructive" size="sm"
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

function ProviderDialog({ catalogue, onSaved }: { catalogue: LlmCatalogue | null; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 shadow-sm active:scale-95 transition-all duration-200">
          <Plus className="h-4 w-4" /> Thêm provider
        </Button>
      </DialogTrigger>
      <ProviderDialogContent catalogue={catalogue} onSaved={() => { setOpen(false); onSaved(); }} />
    </Dialog>
  );
}

function ProviderDialogContent({
  provider, catalogue, onSaved,
}: {
  provider?: LlmProvider;
  catalogue: LlmCatalogue | null;
  onSaved: () => void;
}) {
  const [code,        setCode]        = useState(provider?.code         ?? "");
  const [displayName, setDisplayName] = useState(provider?.display_name ?? "");
  const [adapterType, setAdapterType] = useState(provider?.adapter_type ?? "groq");
  const [baseUrl,     setBaseUrl]     = useState(provider?.base_url     ?? "");
  const [enabled,     setEnabled]     = useState(provider?.enabled      ?? true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const adapters = catalogue?.adapter_types ?? ["groq", "openai_compat", "anthropic", "gemini", "ollama"];

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (provider) {
        await llmConfigService.updateProvider(provider.id, {
          display_name: displayName, adapter_type: adapterType,
          base_url: baseUrl || null, enabled,
        });
      } else {
        await llmConfigService.upsertProvider({
          code, display_name: displayName, adapter_type: adapterType,
          base_url: baseUrl || null, enabled,
        });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {provider ? "Sửa provider" : "Thêm provider"}
        </DialogTitle>
        <DialogDescription className="text-slate-500 dark:text-slate-400">
          Adapter quyết định giao thức gọi API. Base URL dùng cho endpoint tự host (Ollama / vLLM…).
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-1">
        {/* Code */}
        <div className="space-y-1.5">
          <Label htmlFor="prov-code" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Code <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="prov-code"
            value={code}
            disabled={!!provider}
            onChange={(e) => setCode(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="groq / anthropic / ollama-prod"
            className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-60"
          />
        </div>

        {/* Display name */}
        <div className="space-y-1.5">
          <Label htmlFor="prov-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tên hiển thị <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="prov-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Groq"
            className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Adapter */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Adapter type</Label>
          <Select value={adapterType} onValueChange={setAdapterType}>
            <SelectTrigger className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {adapters.map((a) => (
                <SelectItem key={a} value={a}><code className="font-mono text-xs">{a}</code></SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Base URL */}
        <div className="space-y-1.5">
          <Label htmlFor="prov-url" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Base URL <span className="text-slate-400 dark:text-slate-500 font-normal">(tuỳ chọn)</span>
          </Label>
          <Input
            id="prov-url"
            value={baseUrl ?? ""}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://ollama:11434"
            className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        {/* Enabled toggle */}
        <div className="flex items-center gap-3 pt-1">
          <Switch id="prov-enabled" checked={enabled} onCheckedChange={setEnabled} />
          <Label htmlFor="prov-enabled" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Bật provider
          </Label>
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
          disabled={saving || !code || !displayName}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50"
        >
          {saving ? "Đang lưu…" : "Lưu"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}