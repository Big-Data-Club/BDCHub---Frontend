"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Power, PowerOff, Trash2 } from "lucide-react";
import type { LlmApiKey, LlmProvider } from "@/services/llmConfigService";
import { llmConfigService } from "@/services/llmConfigService";
import { StatusBadge } from "./StatusBadge";

type Props = {
  keys: LlmApiKey[];
  providers: LlmProvider[];
  onChanged: () => void;
};

export function KeysPanel({ keys, providers, onChanged }: Props) {
  const providerById = new Map(providers.map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">API Keys</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mỗi provider có thể có nhiều key. Gateway tự chọn key least-loaded và cooldown key khi gặp 429.
          </p>
        </div>
        <AddKeyDialog providers={providers} onSaved={onChanged} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Alias</th>
              <th className="px-4 py-3 text-left">Fingerprint</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Req / ngày</th>
              <th className="px-4 py-3 text-right">Tokens / ngày</th>
              <th className="px-4 py-3 text-right">Quota</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {keys.map((k) => (
              <KeyRow
                key={k.id} k={k}
                provider={providerById.get(k.provider_id)}
                onChanged={onChanged}
              />
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Chưa có API key nào. Nhấn <span className="font-medium text-blue-600">+ Thêm API key</span> để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyRow({
  k, provider, onChanged,
}: {
  k: LlmApiKey;
  provider?: LlmProvider;
  onChanged: () => void;
}) {
  const [busy,     setBusy]     = useState(false);
  const [isActive, setIsActive] = useState(k.status === "active");

  const toggle = async (next: LlmApiKey["status"]) => {
    setIsActive(next === "active");   // optimistic
    setBusy(true);
    try { await llmConfigService.updateApiKey(k.id, { status: next }); onChanged(); }
    catch { setIsActive(k.status === "active"); }  // revert on error
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(`Xoá key "${k.alias}"?`)) return;
    setBusy(true);
    try { await llmConfigService.deleteApiKey(k.id); onChanged(); }
    finally { setBusy(false); }
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
      <td className="px-4 py-3">
        <code className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-300">
          {provider?.code ?? `#${k.provider_id}`}
        </code>
      </td>
      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{k.alias}</td>
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider">{k.fingerprint}</code>
      </td>
      <td className="px-4 py-3"><StatusBadge status={k.status} /></td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
        {k.used_today_requests.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
        {k.used_today_tokens.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-500 dark:text-slate-500">
        {k.daily_token_limit?.toLocaleString() ?? <span className="text-slate-300 dark:text-slate-600">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          {isActive ? (
            <Button variant="outline" size="sm"
              className="gap-1.5 active:scale-95 transition-all duration-200"
              onClick={() => toggle("disabled")} disabled={busy}
            >
              <PowerOff className="h-3.5 w-3.5" /> Tắt
            </Button>
          ) : (
            <Button variant="outline" size="sm"
              className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/30 active:scale-95 transition-all duration-200"
              onClick={() => toggle("active")} disabled={busy}
            >
              <Power className="h-3.5 w-3.5" /> Kích hoạt
            </Button>
          )}
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

function AddKeyDialog({ providers, onSaved }: { providers: LlmProvider[]; onSaved: () => void }) {
  const [open,       setOpen]       = useState(false);
  const [providerId, setProviderId] = useState<string>(providers[0]?.id ? String(providers[0].id) : "");
  const [alias,      setAlias]      = useState("");
  const [plaintext,  setPlaintext]  = useState("");
  const [daily,      setDaily]      = useState<string>("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const resetForm = () => { setAlias(""); setPlaintext(""); setDaily(""); setError(null); };

  const save = async () => {
    if (!providerId || !alias || !plaintext) return;
    setSaving(true);
    setError(null);
    try {
      await llmConfigService.createApiKey({
        provider_id: Number(providerId),
        alias,
        plaintext_key: plaintext,
        daily_token_limit: daily ? Number(daily) : null,
      });
      resetForm();
      setOpen(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button
          disabled={providers.length === 0}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Thêm API key
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Thêm API key</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Key được mã hoá (Fernet) trước khi lưu vào DB. Chỉ fingerprint hiển thị sau khi lưu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Provider */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Provider <span className="text-rose-500">*</span>
            </Label>
            <Select value={providerId} onValueChange={setProviderId}>
              <SelectTrigger className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20">
                <SelectValue placeholder="Chọn provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <span className="font-medium">{p.display_name}</span>
                    <code className="ml-1.5 text-slate-400 text-xs">({p.code})</code>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alias */}
          <div className="space-y-1.5">
            <Label htmlFor="key-alias" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Alias <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="key-alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="groq-prod-01"
              className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>

          {/* Plaintext key */}
          <div className="space-y-1.5">
            <Label htmlFor="key-secret" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              API key <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="key-secret"
              type="password"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="gsk_… / sk-…"
              autoComplete="new-password"
              className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-mono"
            />
          </div>

          {/* Daily token limit */}
          <div className="space-y-1.5">
            <Label htmlFor="key-daily" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Daily token limit{" "}
              <span className="text-slate-400 dark:text-slate-500 font-normal">(tuỳ chọn)</span>
            </Label>
            <Input
              id="key-daily"
              type="number"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              placeholder="vd 1 000 000"
              className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
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
            disabled={saving || !alias || !plaintext || !providerId}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {saving ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}