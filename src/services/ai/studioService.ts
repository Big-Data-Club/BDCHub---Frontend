/**
 * studioService - client for the Content Studio (slide/document authoring).
 * Goes through the Next proxy /api/ai/studio/* which injects auth + secret.
 */
export interface StudioContextSource {
  type: "curriculum" | "text";
  title: string;
  ref?: number | null;
  text?: string;
  section_ids?: number[];
  content_ids?: number[];
}

export interface StudioSection {
  title: string;
  key_points: string[];
  slide_bullets: string[];
  narration: string;
  visual_suggestion: string;
  visual_type: "auto" | "flow" | "cycle" | "comparison" | "hierarchy" | "timeline" | "matrix_dot_product" | "matrix_tiling" | "reduction_tree" | "broadcast_tree" | "resource_timeline" | "queue" | "network_topology" | "process_grid" | "memory_hierarchy" | "data_path" | "algorithm_tree" | "pipeline" | "code_execution" | "architecture" | "collective_communication";
  visual_labels: string[];
  illustration_prompt: string;
  alt_text: string;
  source_refs: string[];
  duration_est_sec: number;
  learning_goal: string;
  key_message: string;
  animation_steps: string[];
  grounding: "source" | "extension";
  visual_spec: {
    nodes: { id: string; label: string; role: "input" | "output" | "intermediate" | "warning" }[];
    edges: { source: string; target: string; label: string }[];
    equation: string;
    code: string;
  };
}

export interface StudioPlan {
  title: string;
  language: "vi" | "en";
  learning_objectives: string[];
  sections: StudioSection[];
  summary: string;
  narrative: { learner_goal: string; misconception: string; concept_dependencies: string[] };
}

export interface StudioProject {
  id: string;
  course_id: number;
  kind: "slides" | "document" | "report" | "video";
  title: string;
  status: "collecting" | "planning" | "planned" | "generating" | "ready" | "failed";
  error_detail?: string | null;
  context_pack: { type: string; title: string; chars?: number }[];
  plan?: StudioPlan | null;
  settings: { planning_warnings?: string[]; theme?: string; aspect_ratio?: "16:9" | "9:16"; context_metrics?: { raw_estimated_tokens: number; used_estimated_tokens: number; input_token_budget: number; hierarchical_reduction: boolean } };
  current_job_id?: string;
  artifacts: { type: string; url: string; inline?: string; asset_id?: string; expires_at?: string }[];
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/ai/studio/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    if (typeof data?.detail === "string") {
      msg = data.detail;
    } else if (Array.isArray(data?.detail)) {
      msg = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join("; ");
    } else if (data?.error) {
      msg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
    }
    throw new Error(msg);
  }
  return data as T;
}

export const studioService = {
  youtubeStatus: (id: string) => call<SharedYoutubeStatus>(`projects/${id}/youtube`),
  uploadVideo: (id: string, payload: Record<string, unknown>) => call<{ upload_id: string }>(`projects/${id}/youtube`, { method: "POST", body: JSON.stringify({ ...payload, confirmed: true }) }),
  uploadStatus: (id: string, uploadId: string) => call<StudioUpload>(`projects/${id}/uploads/${uploadId}`),
  publish: (id: string, sectionId: number, uploadId?: string) => call<{ content: { id: number } }>(`projects/${id}/publish`, { method: "POST", body: JSON.stringify({ section_id: sectionId, upload_id: uploadId, confirmed: true }) }),
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
    patch: Partial<Pick<StudioSection, "title" | "key_points" | "slide_bullets" | "narration" | "visual_suggestion" | "visual_type" | "visual_labels" | "illustration_prompt" | "alt_text" | "source_refs">>
  ) =>
    call<{ project: StudioProject }>(`projects/${id}/sections`, {
      method: "PATCH",
      body: JSON.stringify({ index, patch }),
    }),

  downloadArtifact: async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Không tải được artifact.");
    return response.blob();
  },
  startGenerate: (id: string) =>
    call<{ started?: boolean; already_running?: boolean }>(`projects/${id}/generate`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};

export interface StudioUpload {
  id: string;
  status: "queued" | "running" | "ready" | "failed";
  title: string;
  privacy: string;
  actual_privacy?: string;
  processing_status?: string;
  video_id?: string;
  error?: string;
}

export interface SharedYoutubeStatus {
  connected: boolean;
  channel_id?: string;
  channel_title?: string;
  uploads: StudioUpload[];
}
