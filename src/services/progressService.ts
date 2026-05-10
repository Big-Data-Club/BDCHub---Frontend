/**
 * progressService.ts
 *
 * Handles content completion / progress tracking.
 *
 * ─── Backend endpoints needed ──────────────────────────────────────────────
 * POST /content/{contentId}/complete        → Mark content as viewed/completed
 * DELETE /content/{contentId}/complete      → Undo completion (optional)
 * GET  /courses/{courseId}/my-progress      → Get student's progress in a course
 * GET  /courses/{courseId}/progress-detail  → Detailed list of completed/pending items
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Backend schema additions needed:
 *
 *   CREATE TABLE content_progress (
 *     id           BIGSERIAL PRIMARY KEY,
 *     content_id   BIGINT NOT NULL REFERENCES section_content(id) ON DELETE CASCADE,
 *     student_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *     completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     UNIQUE(content_id, student_id)
 *   );
 *   CREATE INDEX idx_progress_student ON content_progress(student_id);
 *   CREATE INDEX idx_progress_content ON content_progress(content_id);
 */

import { lmsApiClient } from "./lmsApiClient";

export interface CourseProgress {
  course_id: number;
  completed_count: number;
  total_mandatory: number;
  progress_percent: number;
  completed_content_ids: number[];
}

export interface ProgressDetailItem {
  content_id: number;
  content_title: string;
  content_type: string;
  section_title: string;
  is_mandatory: boolean;
  is_completed: boolean;
  completed_at: string | null;
}

class ProgressService {
  /** Mark a content item as completed by the current student */
  async markContentComplete(contentId: number): Promise<{ success: boolean }> {
    const response = await lmsApiClient.post(`/content/${contentId}/complete`, {});
    return response.data;
  }

  /** Get progress summary for a course */
  async getMyCourseProgress(courseId: number): Promise<CourseProgress> {
    const response = await lmsApiClient.get(`/courses/${courseId}/my-progress`);
    return response.data;
  }

  /** Get detailed progress list (each content item with completion status) */
  async getMyCourseProgressDetail(courseId: number): Promise<ProgressDetailItem[]> {
    const response = await lmsApiClient.get(`/courses/${courseId}/progress-detail`);
    return response.data?.items ?? [];
  }
}

export const progressService = new ProgressService();
export default progressService;