export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ContentType = "TEXT" | "VIDEO" | "DOCUMENT" | "IMAGE" | "QUIZ" | "FORUM" | "ANNOUNCEMENT";
export type TabType = "discover" | "my-courses" | "pending";

export interface Course {
  id: number;
  title: string;
  description: string;
  status: string;
  level: string;
  category: string;
  thumbnail_url?: string;
  created_at: string;
  published_at?: string;
  teacher_name?: string;
  teacher_email?: string;
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface CourseSection {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  section_id: number;
  type: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  is_mandatory: boolean;
  metadata?: Record<string, any>;
  updated_at?: any;
  file_path?: string | null;
  ai_index_status?: "not_indexed" | "processing" | "indexed" | "failed";
}

export interface ContentItem {
  id: number;
  section_id: number;
  type: ContentType;
  title: string;
  description?: string;
  content_url?: string;
  file_size?: number;
  file_type?: string;
  duration_seconds?: number;
  order_index: number;
  is_mandatory: boolean;
  counts_for_progress: boolean;
  points_worth: number;
  requires_previous_completion: boolean;
  available_from?: string;
  available_until?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  course_id: number;
  status: "WAITING" | "ACCEPTED" | "REJECTED";
  enrolled_at: string;
  accepted_at?: string;
  rejected_at?: string;
  course_title?: string;
  teacher_name?: string;
  teacher_email?: string;
  progress_percent?: number;
}

export interface FileInfo {
  file_id: string;
  file_name: string;
  file_url: string;
  file_path: string;
  file_size: number;
  file_type: string;
}

export interface FileToUpload {
  id: string;
  file: File;
  type: "video" | "document" | "image";
  title: string;
  description: string;
  isMandatory: boolean;
  uploadedFile: any | null;
  uploadError: string;
  uploadStatus: "pending" | "uploading" | "success" | "error";
}
