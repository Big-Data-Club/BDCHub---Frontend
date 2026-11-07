export type HighlightColor = "yellow" | "green" | "blue" | "pink";
export interface NotebookAnnotation {
  version: 1;
  content_id: number;
  quote: string;
  prefix: string;
  suffix: string;
  start: number;
  end: number;
  color: HighlightColor;
}
export interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  user_id?: number;
  course_id?: number | null;
  node_id?: number | null;
  created_at: string;
  updated_at?: string;
  annotation?: NotebookAnnotation | null;
}

export interface NotebookDraft {
  id?: string;
  key: string;
  title: string;
  content: string;
  annotation?: NotebookAnnotation | null;
}
