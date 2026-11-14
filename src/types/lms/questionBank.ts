export interface BankItem {
  id: number;
  question_type: string;
  question_text: string;
  points: number;
  bloom_level?: string;
  difficulty: string;
  node_id?: number | null;
  source: string;
  status: string;
  created_at: string;
  explanation?: string;
  answer_options?: {
    option_text: string;
    is_correct: boolean;
    order_index: number;
  }[];
  correct_answers?: { answer_text?: string; blank_id?: number | null }[];
}

export interface BankStats {
  total: number;
  dangling_count: number;
  by_difficulty: Record<string, number>;
  by_source: Record<string, number>;
  by_month: { month: string; count: number }[];
}

export interface BankFilters {
  q: string;
  difficulty: string;
  bloom: string;
  source: string;
  month: string;
  sort: string;
  order: "asc" | "desc";
}
