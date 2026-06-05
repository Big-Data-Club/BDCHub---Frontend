import { lmsApiClient } from "./lmsApiClient";
import type { SectionOverviewJob, SectionOverviewJobDetail } from "@/types";

export const sectionOverviewService = {
  generate: async (
    courseId: number,
    sectionId: number,
    data: { language: string; question_count: number },
  ): Promise<{ job_id: number; status: string }> => {
    const res = await lmsApiClient.post<{ data: { job_id: number; status: string } }>(
      `/courses/${courseId}/sections/${sectionId}/overview/generate`,
      data,
    );
    return res.data.data;
  },

  listJobs: async (courseId: number, sectionId: number): Promise<SectionOverviewJob[]> => {
    const res = await lmsApiClient.get<{ data: SectionOverviewJob[] }>(
      `/courses/${courseId}/sections/${sectionId}/overview/jobs`,
    );
    return res.data.data;
  },

  getJob: async (jobId: number): Promise<SectionOverviewJobDetail> => {
    const res = await lmsApiClient.get<{ data: SectionOverviewJobDetail }>(
      `/section-overview/jobs/${jobId}`,
    );
    return res.data.data;
  },

  updateLesson: async (
    lessonId: number,
    data: { title?: string; markdown_content?: string },
  ): Promise<void> => {
    await lmsApiClient.put<unknown>(`/section-overview/lessons/${lessonId}`, data);
  },

  publishLesson: async (
    lessonId: number,
    data: { section_id: number; order_index: number },
  ): Promise<{ section_content_id: number }> => {
    const res = await lmsApiClient.post<{ data: { section_content_id: number } }>(
      `/section-overview/lessons/${lessonId}/publish`,
      data,
    );
    return res.data.data;
  },

  updateQuiz: async (
    quizId: number,
    data: { title?: string; questions?: unknown[] },
  ): Promise<void> => {
    await lmsApiClient.put<unknown>(`/section-overview/quizzes/${quizId}`, data);
  },

  publishQuiz: async (
    quizId: number,
    data: { section_id: number; order_index: number; time_limit_minutes?: number },
  ): Promise<{ published_quiz_id: number }> => {
    const res = await lmsApiClient.post<{ data: { published_quiz_id: number } }>(
      `/section-overview/quizzes/${quizId}/publish`,
      data,
    );
    return res.data.data;
  },

  deleteJob: async (jobId: number): Promise<void> => {
    await lmsApiClient.delete<unknown>(`/section-overview/jobs/${jobId}`);
  },
};


