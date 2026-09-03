"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Cpu, Key, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";

type Client = "Claude Code" | "Codex" | "OpenCode";
interface McpKeyItem {
  id: number;
  name: string;
  masked_key: string;
  scopes: string[];
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

const ENDPOINT = "https://bdc.hpcc.vn/mcp";

function clientConfig(client: Client, key: string): string {
  if (client === "Claude Code") {
    return `claude mcp add --transport http bdc-hub ${ENDPOINT} \\\n+  --header "Authorization: Bearer ${key}"`;
  }
  if (client === "Codex") {
    return `export BDC_MCP_TOKEN='${key}'\n\n# ~/.codex/config.toml\n[mcp_servers.bdc_hub]\nurl = "${ENDPOINT}"\nbearer_token_env_var = "BDC_MCP_TOKEN"\ndefault_tools_approval_mode = "writes"`;
  }
  return JSON.stringify({
    $schema: "https://opencode.ai/config.json",
    mcp: {
      "bdc-hub": {
        type: "remote",
        url: ENDPOINT,
        enabled: true,
        headers: { Authorization: `Bearer ${key}` },
      },
    },
  }, null, 2);
}

export default function McpApiKeyTab() {
  const [keys, setKeys] = useState<McpKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [writeAccess, setWriteAccess] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [client, setClient] = useState<Client>("Claude Code");
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/mcp/keys", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setKeys(data.keys ?? []);
    } catch {
      setMessage({ type: "error", text: "Không thể tải danh sách MCP API key." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchKeys(); }, [fetchKeys]);
  const config = useMemo(() => rawKey ? clientConfig(client, rawKey) : "", [client, rawKey]);

  async function copy(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function createKey(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const response = await fetch("/api/ai/mcp/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "External AI client",
          scopes: writeAccess ? ["read", "write"] : ["read"],
          expires_in_days: 90,
        }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || errorBody.error || "Không thể tạo API key.");
      }
      const data = await response.json();
      setRawKey(data.api_key);
      setName("");
      setWriteAccess(false);
      setShowCreate(false);
      await fetchKeys();
      setMessage({ type: "success", text: "Đã tạo key. Hãy lưu ngay vì key chỉ hiển thị một lần." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Tạo key thất bại." });
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: number) {
    if (!window.confirm("Thu hồi key này ngay? Ứng dụng đang dùng key sẽ mất kết nối.")) return;
    const response = await fetch(`/api/ai/mcp/keys/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage({ type: "error", text: "Không thể thu hồi key." });
      return;
    }
    setKeys(current => current.filter(item => item.id !== id));
    setMessage({ type: "success", text: "Đã thu hồi key." });
  }

  function closeRawKey() {
    setRawKey(null);
    setCopied(null);
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"}`}>
          {message.text}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 sm:p-6 dark:border-indigo-500/20 dark:from-indigo-950/70 dark:via-slate-900 dark:to-violet-950/60">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex gap-4">
            <div className="h-fit rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Cpu className="h-7 w-7" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold">Kết nối AI của bạn với BDC Hub</h3>
                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">MCP ready</span>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Dùng model và tài khoản Claude, Codex hoặc OpenCode của bạn để suy luận. BDC Hub chỉ cung cấp dữ liệu được cấp quyền và thực hiện thao tác bạn duyệt - không chuyển chi phí model sang gateway hệ thống.
              </p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">
            <Plus className="h-4 w-4" /> Tạo API key
          </button>
        </div>
      </section>

      {rawKey && (
        <section className="space-y-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" /><div><h4 className="font-bold">Key chỉ hiển thị lần này</h4><p className="text-sm text-slate-600 dark:text-slate-400">Không commit key vào Git và không gửi cho người khác. Đóng khung này sẽ xóa key khỏi giao diện.</p></div></div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
            <code className="min-w-0 flex-1 break-all text-xs text-emerald-700 dark:text-emerald-400">{rawKey}</code>
            <button onClick={() => void copy(rawKey, "key")} className="rounded-lg border p-2" aria-label="Copy API key">{copied === "key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
          </div>
          <div className="flex flex-wrap gap-2">{(["Claude Code", "Codex", "OpenCode"] as Client[]).map(item => <button key={item} onClick={() => setClient(item)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${client === item ? "bg-indigo-600 text-white" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{item}</button>)}</div>
          <div className="relative"><pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 pr-12 text-xs text-indigo-200">{config}</pre><button onClick={() => void copy(config, "config")} className="absolute right-2 top-2 rounded-lg bg-slate-800 p-2 text-slate-200" aria-label="Copy configuration">{copied === "config" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div>
          <button onClick={closeRawKey} className="w-full rounded-xl border border-emerald-300 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-300">Tôi đã lưu key, đóng lại</button>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2"><Key className="h-5 w-5 text-indigo-500" /><h4 className="font-bold">API key đang hoạt động ({keys.length}/5)</h4></div>
        {loading ? <Loader2 className="mx-auto my-8 h-6 w-6 animate-spin text-indigo-500" /> : keys.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Chưa có key. Nên bắt đầu với key chỉ đọc.</p> : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">{keys.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{item.name}</span><code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-950">{item.masked_key}</code>{item.scopes.map(scope => <span key={scope} className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${scope === "write" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"}`}>{scope}</span>)}</div><p className="mt-1 text-xs text-slate-500">Tạo {new Date(item.created_at).toLocaleDateString("vi-VN")} · Hết hạn {item.expires_at ? new Date(item.expires_at).toLocaleDateString("vi-VN") : "không giới hạn"} · Dùng gần nhất {item.last_used_at ? new Date(item.last_used_at).toLocaleString("vi-VN") : "chưa dùng"}</p></div>
              <button onClick={() => void revoke(item.id)} className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" aria-label={`Thu hồi ${item.name}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}</div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
        <h5 className="font-bold text-slate-800 dark:text-slate-200">Quyền truy cập rõ ràng</h5>
        <p className="mt-2"><strong>Read</strong> chỉ xem khóa học, node và tìm trong tài liệu. <strong>Write</strong> thêm quyền lưu draft, tạo section hoặc khởi chạy index; server vẫn kiểm tra quyền sở hữu và client phải hỏi xác nhận trước khi ghi.</p>
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form onSubmit={createKey} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h4 className="text-lg font-bold">Tạo MCP API key</h4>
            <label className="block text-sm font-medium">Tên thiết bị / ứng dụng<input value={name} onChange={event => setName(event.target.value)} maxLength={100} required placeholder="Codex trên MacBook" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-indigo-500 dark:border-slate-700" /></label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><input type="checkbox" checked={writeAccess} onChange={event => setWriteAccess(event.target.checked)} className="mt-1" /><span><span className="block text-sm font-semibold">Cho phép thao tác ghi</span><span className="text-xs text-slate-500">Bỏ chọn nếu chỉ cần hỏi và tìm tài liệu. Key tự hết hạn sau 90 ngày.</span></span></label>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border px-4 py-2 text-sm">Hủy</button><button disabled={creating} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{creating && <Loader2 className="h-4 w-4 animate-spin" />} Tạo key</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
