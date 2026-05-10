import { apiClient } from "./api";

// ── Types ────────────────────────────────────────────────────────────────
export interface LlmProvider {
  id: number;
  code: string;
  display_name: string;
  adapter_type: string;
  base_url: string | null;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface LlmModel {
  id: number;
  provider_id: number;
  provider_code: string;
  adapter_type: string;
  model_name: string;
  display_name: string | null;
  family: string | null;
  context_window: number;
  supports_json: boolean;
  supports_tools: boolean;
  supports_streaming: boolean;
  supports_vision: boolean;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  default_temperature: number;
  default_max_tokens: number;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface LlmApiKey {
  id: number;
  provider_id: number;
  alias: string;
  fingerprint: string;
  status: "active" | "cooldown" | "disabled" | "invalid";
  rpm_limit: number | null;
  tpm_limit: number | null;
  daily_token_limit: number | null;
  used_today_requests: number;
  used_today_tokens: number;
  cooldown_until: string | null;
  consecutive_failures: number;
}

export interface LlmBinding {
  id: number;
  task_code: string;
  model: LlmModel;
  priority: number;
  temperature: number | null;
  max_tokens: number | null;
  json_mode: boolean;
  pinned: boolean;
  enabled: boolean;
}

export interface LlmCatalogue {
  adapter_types: string[];
  task_codes: string[];
}

export interface LlmUsageRow {
  provider_code: string;
  model_name: string;
  task_code: string;
  calls: number;
  successes: number;
  failures: number;
  fallbacks: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  avg_latency_ms: number;
}

export interface LlmUsageResponse {
  since_hours: number;
  task_code: string | null;
  rows: LlmUsageRow[];
}

export interface LlmTestCallResponse {
  content: string;
  model: string;
  provider: string;
  fallback_used: boolean;
  attempt_no: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
}

// ── Request payloads ─────────────────────────────────────────────────────
export interface ProviderInput {
  code: string;
  display_name: string;
  adapter_type: string;
  base_url?: string | null;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface ProviderPatch {
  display_name?: string;
  adapter_type?: string;
  base_url?: string | null;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface ModelInput {
  provider_id: number;
  model_name: string;
  display_name?: string | null;
  family?: string | null;
  context_window?: number;
  supports_json?: boolean;
  supports_tools?: boolean;
  supports_streaming?: boolean;
  supports_vision?: boolean;
  input_cost_per_1k?: number;
  output_cost_per_1k?: number;
  default_temperature?: number;
  default_max_tokens?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export type ModelPatch = Partial<Omit<ModelInput, "provider_id">>;

export interface ApiKeyInput {
  provider_id: number;
  alias: string;
  plaintext_key: string;
  rpm_limit?: number | null;
  tpm_limit?: number | null;
  daily_token_limit?: number | null;
  status?: "active" | "cooldown" | "disabled" | "invalid";
}

export interface ApiKeyPatch {
  alias?: string;
  plaintext_key?: string;
  rpm_limit?: number | null;
  tpm_limit?: number | null;
  daily_token_limit?: number | null;
  status?: "active" | "cooldown" | "disabled" | "invalid";
}

export interface BindingInput {
  task_code: string;
  model_id: number;
  priority?: number;
  temperature?: number | null;
  max_tokens?: number | null;
  json_mode?: boolean;
  pinned?: boolean;
  enabled?: boolean;
  notes?: string | null;
}

export interface BindingPatch {
  priority?: number;
  temperature?: number | null;
  max_tokens?: number | null;
  json_mode?: boolean;
  pinned?: boolean;
  enabled?: boolean;
  notes?: string | null;
}

export interface TestCallInput {
  task?: string;
  model_hint?: string;
  prompt: string;
}

// ── API ──────────────────────────────────────────────────────────────────
const BASE = "/api/admin/llm";

function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export const llmConfigService = {
  // Catalogue
  getCatalogue: () => apiClient.get<LlmCatalogue>(`${BASE}/catalogue`),

  // Providers
  listProviders: () => apiClient.get<LlmProvider[]>(`${BASE}/providers`),
  upsertProvider: (body: ProviderInput) => apiClient.post<LlmProvider>(`${BASE}/providers`, body),
  updateProvider: (id: number, body: ProviderPatch) =>
    apiClient.patch<LlmProvider>(`${BASE}/providers/${id}`, body),
  deleteProvider: (id: number) => apiClient.delete(`${BASE}/providers/${id}`),

  // Models
  listModels: (providerId?: number, onlyEnabled?: boolean) =>
    apiClient.get<LlmModel[]>(
      `${BASE}/models${qs({ providerId, onlyEnabled })}`
    ),
  upsertModel: (body: ModelInput) => apiClient.post<LlmModel>(`${BASE}/models`, body),
  updateModel: (id: number, body: ModelPatch) => apiClient.patch<LlmModel>(`${BASE}/models/${id}`, body),
  deleteModel: (id: number) => apiClient.delete(`${BASE}/models/${id}`),

  // API keys
  listApiKeys: (providerId?: number) =>
    apiClient.get<LlmApiKey[]>(`${BASE}/keys${qs({ providerId })}`),
  createApiKey: (body: ApiKeyInput) => apiClient.post<LlmApiKey>(`${BASE}/keys`, body),
  updateApiKey: (id: number, body: ApiKeyPatch) =>
    apiClient.patch<LlmApiKey>(`${BASE}/keys/${id}`, body),
  deleteApiKey: (id: number) => apiClient.delete(`${BASE}/keys/${id}`),

  // Bindings
  listBindings: (taskCode?: string) =>
    apiClient.get<LlmBinding[]>(`${BASE}/bindings${qs({ taskCode })}`),
  upsertBinding: (body: BindingInput) => apiClient.post<LlmBinding>(`${BASE}/bindings`, body),
  updateBinding: (id: number, body: BindingPatch) =>
    apiClient.patch<LlmBinding>(`${BASE}/bindings/${id}`, body),
  deleteBinding: (id: number) => apiClient.delete(`${BASE}/bindings/${id}`),

  // Usage + test
  getUsage: (sinceHours: number = 24, taskCode?: string) =>
    apiClient.get<LlmUsageResponse>(`${BASE}/usage${qs({ sinceHours, taskCode })}`),
  testCall: (body: TestCallInput) => apiClient.post<LlmTestCallResponse>(`${BASE}/test-call`, body),
};