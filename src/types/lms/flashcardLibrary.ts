export interface CardDraft {
  id?: number;
  front_text: string;
  back_text: string;
  accepted_answers: string[];
  note: string;
  language: string;
  answer_language: string;
  match_mode: "exact" | "ai";
  case_sensitive: boolean;
}
export interface PersonalCard extends CardDraft {
  id: number;
  deck_id: number;
  revision: number;
  due_at: string;
  repetitions: number;
  interval_days: number;
}
export interface FlashcardLibrary {
  unassigned_decks: { id: number; name: string; count: number }[];
  decks: { id: number; name: string }[];
  cards: PersonalCard[];
}
export interface AnswerResult {
  correct: boolean;
  feedback: string;
  back_text: string;
  note: string;
  due_at: string;
}
export interface FlashcardJob<T> {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: T;
  error?: string;
}
