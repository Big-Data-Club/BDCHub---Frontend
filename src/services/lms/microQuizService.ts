/**
 * microQuizService.ts
 * Frontend client for the AI-powered micro-quiz generator.
 *
 * The backend (Go lms-service) owns the canonical jobs + quizzes;
 * AI service is only invoked transparently. This service sits on top
 * of the Go endpoints and maps the responses to typed objects the UI
 * components consume directly.
 */
import { lmsApiClient } from "./lmsApiClient";

export type MicroQuizJobStatus = "queued" | "processing" | "completed" | "failed";
export type MicroQuizStatus = "draft" | "published" | "archived";

export interface MicroQuizJob {
  id: number;
  course_id: number;
  section_id?: number | null;
  source_content_id?: number | null;
  source_file_path?: { String: string; Valid: boolean };
  source_file_type?: { String: string; Valid: boolean };
  source_url?: { String: string; Valid: boolean };
  language: string;
  status: MicroQuizJobStatus;
  progress: number;
  stage: string;
  quizzes_count: number;
  error?: { String: string; Valid: boolean };
  created_by: number;
  created_at: string;
  updated_at: string;
  completed_at?: { Time: string; Valid: boolean };
}

export interface QuizQuestionOption {
  text: string;
  is_correct: boolean;
}

export interface QuizQuestionItem {
  question: string;
  options: QuizQuestionOption[];
  explanation: string;
  bloom_level: string;
}

export interface MicroQuiz {
  id: number;
  job_id: number;
  course_id: number;
  section_id?: { Int64: number; Valid: boolean };
  source_content_id?: { Int64: number; Valid: boolean };
  title: string;
  summary?: { String: string; Valid: boolean };
  questions_json: QuizQuestionItem[] | string;
  questions_count: number;
  order_index: number;
  status: MicroQuizStatus;
  published_content_id?: { Int64: number; Valid: boolean };
  node_id?: { Int64: number; Valid: boolean };
  language: string;
  created_at: string;
  updated_at: string;
  published_at?: { Time: string; Valid: boolean };
}

export interface GenerateQuizOptions {
  contentId?: number;
  youtubeUrl?: string;
  sectionId?: number;
  language?: string;
}

export interface GenerateQuizResponse {
  job_id: number;
  status: MicroQuizJobStatus;
}

export interface JobWithQuizzes {
  job: MicroQuizJob;
  quizzes: MicroQuiz[];
}

export interface UpdateQuizInput {
  title: string;
  summary?: string;
  questions_json: QuizQuestionItem[];
  order_index?: number;
}

class MicroQuizService {
  async generate(courseId: number, opts: GenerateQuizOptions): Promise<GenerateQuizResponse> {
    const body = {
      content_id: opts.contentId ?? 0,
      youtube_url: opts.youtubeUrl ?? "",
      section_id: opts.sectionId,
      language: opts.language ?? "vi",
    };
    const res = await lmsApiClient.post(`/courses/${courseId}/micro-quizzes/generate`, body);
    return res.data?.data ?? res.data;
  }

  async listJobs(courseId: number): Promise<MicroQuizJob[]> {
    const res = await lmsApiClient.get(`/courses/${courseId}/micro-quizzes/jobs`);
    return res.data?.data ?? [];
  }

  async getJob(jobId: number): Promise<JobWithQuizzes> {
    const res = await lmsApiClient.get(`/micro-quizzes/jobs/${jobId}`);
    return res.data?.data ?? { job: null as unknown as MicroQuizJob, quizzes: [] };
  }

  async updateQuiz(quizId: number, input: UpdateQuizInput): Promise<void> {
    await lmsApiClient.put(`/micro-quizzes/${quizId}`, input);
  }

  async publishQuiz(
    quizId: number,
    sectionId: number,
    orderIndex?: number,
  ): Promise<{ section_content_id: number; quiz_id: number; status: string }> {
    const res = await lmsApiClient.post(`/micro-quizzes/${quizId}/publish`, {
      section_id: sectionId,
      order_index: orderIndex ?? 0,
    });
    return res.data?.data ?? res.data;
  }

  async deleteQuiz(quizId: number): Promise<void> {
    await lmsApiClient.delete(`/micro-quizzes/${quizId}`);
  }
}

export const microQuizService = new MicroQuizService();
export default microQuizService;

// ── Helpers ─────────────────────────────────────────────────────────────────

export function parseQuestions(raw: QuizQuestionItem[] | string | unknown): QuizQuestionItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as QuizQuestionItem[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function unwrapNullString(v: { String: string; Valid: boolean } | undefined): string {
  return v && v.Valid ? v.String : "";
}

export function unwrapNullInt(v: { Int64: number; Valid: boolean } | undefined): number | null {
  return v && v.Valid ? v.Int64 : null;
}

const BLOOM_LABELS: Record<string, string> = {
  remember: "Nhớ",
  understand: "Hiểu",
  apply: "Áp dụng",
  analyze: "Phân tích",
  evaluate: "Đánh giá",
  create: "Sáng tạo",
};

export function bloomLabel(level: string): string {
  return BLOOM_LABELS[level] ?? level;
}

export function bloomColor(level: string): string {
  const map: Record<string, string> = {
    remember: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    understand: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300",
    apply: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    analyze: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    evaluate: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300",
    create: "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
  };
  return map[level] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}
