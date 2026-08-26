/**
 * studioService — client for the Content Studio (slide/document authoring).
 * Goes through the Next proxy /api/ai/studio/* which injects auth + secret.
 */
export interface StudioContextSource {
  type: "node" | "text" | "document_url";
  title: string;
  ref?: number | null;
  text?: string;
}

export interface StudioSection {
  title: string;
  key_points: string[];
  slide_bullets: string[];
  narration: string;
  visual_suggestion: string;
  duration_est_sec: number;
}

export interface StudioPlan {
  title: string;
  language: "vi" | "en";
  learning_objectives: string[];
  sections: StudioSection[];
  summary: string;
}

export interface StudioProject {
  id: string;
  course_id: number;
  kind: "slides" | "document" | "video";
  title: string;
  status: "collecting" | "planned" | "generating" | "ready" | "failed";
  error_detail?: string | null;
  context_pack: { type: string; title: string; chars?: number }[];
  plan?: StudioPlan | null;
  settings: Record<string, any>;
  artifacts: { type: string; url: string; inline?: string }[];
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/ai/studio/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const studioService = {
  createProject: (payload: { course_id: number; kind: string; title: string; settings?: Record<string, any> }) =>
    call<StudioProject>("projects", { method: "POST", body: JSON.stringify(payload) }),

  getProject: (id: string) => call<StudioProject>(`projects/${id}`),

  addContext: (id: string, source: StudioContextSource) =>
    call<{ duplicate: boolean; sources: number; chars?: number }>(
      `projects/${id}/context`,
      { method: "POST", body: JSON.stringify(source) }
    ),

  generatePlan: (id: string, targetSections?: number) =>
    call<{ project: StudioProject; warnings: string[] }>(`projects/${id}/plan`, {
      method: "POST",
      body: JSON.stringify({ target_sections: targetSections ?? null }),
    }),

  updatePlan: (id: string, plan: StudioPlan) =>
    call<{ project: StudioProject }>(`projects/${id}/plan`, {
      method: "PUT",
      body: JSON.stringify({ plan }),
    }),

  updateSection: (
    id: string,
    index: number,
    patch: Partial<Pick<StudioSection, "title" | "key_points" | "slide_bullets" | "narration">>
  ) =>
    call<{ project: StudioProject }>(`projects/${id}/sections`, {
      method: "PATCH",
      body: JSON.stringify({ index, patch }),
    }),

  startGenerate: (id: string) =>
    call<{ started?: boolean; already_running?: boolean }>(`projects/${id}/generate`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};
