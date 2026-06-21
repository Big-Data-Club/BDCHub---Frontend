export interface LatexProject {
  id: number;
  user_id: number;
  title: string;
  description: string;
  compiler: "pdflatex" | "xelatex" | "lualatex";
  main_file: string;
  template_id?: string;
  status: "active" | "archived" | "deleted";
  file_count?: number;
  last_compiled_at?: string;
  created_at: string;
  updated_at: string;
  user_role?: "owner" | "editor" | "reviewer" | "viewer";
}

export interface LatexFile {
  id: number;
  project_id: number;
  filename: string;
  filepath: string;
  file_size: number;
  mime_type: string;
  content_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface CompileJob {
  job_id: string;
  project_id: number;
  status: "queued" | "compiling" | "success" | "failed" | "timeout";
  compiler: string;
  pdf_url?: string;
  log_output?: string;
  error_message?: string;
  duration_ms?: number;
  created_at: string;
  completed_at?: string;
  queue_position?: number;
}

export interface LatexTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  files: string[];
}

export interface TexPackage {
  name: string;
  description: string;
  category: string;
  installed: boolean;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  compiler?: "pdflatex" | "xelatex" | "lualatex";
  template_id?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  compiler?: "pdflatex" | "xelatex" | "lualatex";
  main_file?: string;
}

// ── Collaboration ────────────────────────────────────────────────────────────

export interface Collaborator {
  id: number;
  project_id: number;
  user_id: number;
  user_email: string;
  role: "editor" | "reviewer" | "viewer";
  added_by: number;
  created_at: string;
}

export interface LatexComment {
  id: number;
  project_id: number;
  file_id: number;
  user_id: number;
  user_email: string;
  content: string;
  selection_start?: number;
  selection_end?: number;
  selected_text?: string;
  parent_id?: number;
  resolved: boolean;
  resolved_by?: number;
  resolved_at?: string;
  replies?: LatexComment[];
  created_at: string;
  updated_at: string;
}

export interface ShareLink {
  id: number;
  project_id: number;
  token: string;
  role: "editor" | "reviewer" | "viewer";
  created_by: number;
  active: boolean;
  expires_at?: string;
  created_at: string;
  url: string;
}
