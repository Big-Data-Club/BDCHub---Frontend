"use client";

import { useState } from "react";
import { useLlmConfig } from "@/hooks/useLlmConfig";
import { ProvidersPanel } from "@/components/lms/admin/llm-config/ProvidersPanel";
import { KeysPanel }      from "@/components/lms/admin/llm-config/KeysPanel";
import { ModelsPanel }    from "@/components/lms/admin/llm-config/ModelsPanel";
import { BindingsPanel }  from "@/components/lms/admin/llm-config/BindingsPanel";
import { UsagePanel }     from "@/components/lms/admin/llm-config/UsagePanel";
import { TestCallPanel }  from "@/components/lms/admin/llm-config/TestCallPanel";

type Tab = "providers" | "keys" | "models" | "bindings" | "usage" | "test";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "providers", label: "Providers", description: "Nhà cung cấp LLM" },
  { id: "keys",      label: "API Keys",  description: "Pool key theo provider" },
  { id: "models",    label: "Models",    description: "Model catalog" },
  { id: "bindings",  label: "Bindings",  description: "Task → fallback chain" },
  { id: "usage",     label: "Usage",     description: "Tokens / latency / fallback" },
  { id: "test",      label: "Test",      description: "Sanity check 1 prompt" },
];

export default function LlmConfigPage() {
  const [tab, setTab] = useState<Tab>("providers");
  const state = useLlmConfig();

  if (state.loading && state.providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.error && state.providers.length === 0) {
    return (
      <div className="rounded-lg border border-rose-300 bg-rose-50 dark:bg-rose-900/20 p-6 text-sm text-rose-700 dark:text-rose-400">
        <p className="font-semibold mb-1">Không thể tải cấu hình LLM</p>
        <p>{state.error}</p>
        <button
          className="mt-3 rounded bg-rose-600 text-white px-3 py-1.5 text-sm hover:bg-rose-700"
          onClick={state.refresh}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Cấu hình LLM</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Quản lý providers, API keys, models và fallback chain cho từng task. Thay đổi áp dụng trong
          &le;30 giây, không cần restart.
        </p>
      </header>

      <nav className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active
                  ? "border-blue-600 text-blue-700 dark:text-blue-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "providers" && (
        <ProvidersPanel
          providers={state.providers}
          catalogue={state.catalogue}
          onChanged={state.refresh}
        />
      )}
      {tab === "keys" && (
        <KeysPanel keys={state.keys} providers={state.providers} onChanged={state.refresh} />
      )}
      {tab === "models" && (
        <ModelsPanel models={state.models} providers={state.providers} onChanged={state.refresh} />
      )}
      {tab === "bindings" && (
        <BindingsPanel
          bindings={state.bindings}
          models={state.models}
          catalogue={state.catalogue}
          onChanged={state.refresh}
        />
      )}
      {tab === "usage" && <UsagePanel catalogue={state.catalogue} />}
      {tab === "test"  && <TestCallPanel catalogue={state.catalogue} />}
    </div>
  );
}