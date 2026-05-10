/**
 * microLessonService.ts
 * Frontend client for the AI-powered micro-lesson generator.
 *
 * The backend (Go lms-service) owns the canonical jobs + lessons; AI
 * service is only invoked transparently. This service sits on top of
 * the Go endpoints and maps the responses to typed objects the UI
 * components consume directly.
 */
import { lmsApiClient } from "./lmsApiClient";

export type MicroJobStatus = "queued" | "processing" | "completed" | "failed";
export type MicroLessonStatus = "draft" | "published" | "archived";

export interface MicroLessonJob {
  id: number;
  course_id: number;
  section_id?: number | null;
  source_content_id?: number | null;
  source_file_path?: { String: string; Valid: boolean };
  source_file_type?: { String: string; Valid: boolean };
  source_url?: { String: string; Valid: boolean };
  target_minutes: number;
  language: string;
  status: MicroJobStatus;
  progress: number;
  stage: string;
  lessons_count: number;
  error?: { String: string; Valid: boolean };
  created_by: number;
  created_at: string;
  updated_at: string;
  completed_at?: { Time: string; Valid: boolean };
}

export interface MicroLesson {
  id: number;
  job_id: number;
  course_id: number;
  section_id?: { Int64: number; Valid: boolean };
  source_content_id?: { Int64: number; Valid: boolean };
  title: string;
  summary?: { String: string; Valid: boolean };
  objectives: string[] | null | unknown;        // JSON column — parsed below
  markdown_content: string;
  estimated_minutes: number;
  order_index: number;
  status: MicroLessonStatus;
  published_content_id?: { Int64: number; Valid: boolean };
  image_urls: string[] | null | unknown;        // JSON column
  language: string;
  created_at: string;
  updated_at: string;
  published_at?: { Time: string; Valid: boolean };
}

export interface GenerateOptions {
  contentId?: number;
  youtubeUrl?: string;
  sectionId?: number;
  targetMinutes?: number;
  language?: string;
}

export interface GenerateResponse {
  job_id: number;
  status: MicroJobStatus;
}

export interface JobWithLessons {
  job: MicroLessonJob;
  lessons: MicroLesson[];
}

export interface UpdateLessonInput {
  title: string;
  summary?: string;
  objectives?: string[];
  markdown_content: string;
  estimated_minutes: number;
  order_index?: number;
}

class MicroLessonService {
  async generate(courseId: number, opts: GenerateOptions): Promise<GenerateResponse> {
    const body = {
      content_id: opts.contentId ?? 0,
      youtube_url: opts.youtubeUrl ?? "",
      section_id: opts.sectionId,
      target_minutes: opts.targetMinutes ?? 5,
      language: opts.language ?? "vi",
    };
    const res = await lmsApiClient.post(`/courses/${courseId}/micro-lessons/generate`, body);
    return res.data?.data ?? res.data;
  }

  async listJobs(courseId: number): Promise<MicroLessonJob[]> {
    const res = await lmsApiClient.get(`/courses/${courseId}/micro-lessons/jobs`);
    return res.data?.data ?? [];
  }

  async getJob(jobId: number): Promise<JobWithLessons> {
    const res = await lmsApiClient.get(`/micro-lessons/jobs/${jobId}`);
    return res.data?.data ?? { job: null as unknown as MicroLessonJob, lessons: [] };
  }

  async updateLesson(lessonId: number, input: UpdateLessonInput): Promise<void> {
    await lmsApiClient.put(`/micro-lessons/${lessonId}`, input);
  }

  async publishLesson(
    lessonId: number,
    sectionId: number,
    orderIndex?: number,
  ): Promise<{ section_content_id: number; status: string }> {
    const res = await lmsApiClient.post(`/micro-lessons/${lessonId}/publish`, {
      section_id: sectionId,
      order_index: orderIndex ?? 0,
    });
    return res.data?.data ?? res.data;
  }

  async deleteLesson(lessonId: number): Promise<void> {
    await lmsApiClient.delete(`/micro-lessons/${lessonId}`);
  }
}

export const microLessonService = new MicroLessonService();
export default microLessonService;

// ── Helpers for unwrapping Go's nullable JSON shapes ────────────────────────

export function unwrapNullString(v: { String: string; Valid: boolean } | undefined): string {
  return v && v.Valid ? v.String : "";
}

export function unwrapNullInt(v: { Int64: number; Valid: boolean } | undefined): number | null {
  return v && v.Valid ? v.Int64 : null;
}

export function asObjectives(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try { const parsed = JSON.parse(v); return Array.isArray(parsed) ? parsed.map(String) : []; }
    catch { return []; }
  }
  return [];
}

export function asImageUrls(v: unknown): string[] {
  return asObjectives(v);
}