export type VideoJobStatus =
  | "PENDING"
  | "PLANNING"
  | "SCRIPTING"
  | "RENDERING"
  | "UPLOADING"
  | "COMPLETED"
  | "PUBLISHING"
  | "PUBLIC"
  | "FAILED"
  | "CANCELLED";

export interface VideoJob {
  id: string;
  target_type: "course" | "section";
  target_id: number;
  custom_prompt?: string;
  language: string;
  template_type: string;
  created_by: number;
  status: VideoJobStatus;
  progress: number;
  retry_count: number;
  last_error_message?: string;
  youtube_video_id?: string;
  youtube_url?: string;
  visibility: "unlisted" | "public";
  created_at: string;
  updated_at: string;
}
