export interface QuizIndexItem {
  question_id: number;
  source_hash: string;
  node_id: number | null;
  node_name: string | null;
  suggested_node_id: number | null;
  suggested_node_name: string | null;
  suggestion_score: number | null;
}
export interface QuizIndexState {
  status:
    | "not_indexed"
    | "pending"
    | "processing"
    | "ready"
    | "failed"
    | "stale"
    | "interrupted";
  total: number;
  processed: number;
  items: QuizIndexItem[];
}
export interface QuizNodeStatistics {
  node_id: number | null;
  students: number;
  attempted: number;
  graded_attempts: number;
  pending_answers: number;
  backfilled_answers: number;
  average_percentage: number | null;
  distribution: number[];
}
export interface QuizIndexMatch {
  question_id: number;
  content: string;
  node_id: number | null;
  score: number;
}
export interface QuizNodeLink {
  question_id: number;
  source_hash: string;
  node_id?: number;
  name?: string;
  description?: string;
}
