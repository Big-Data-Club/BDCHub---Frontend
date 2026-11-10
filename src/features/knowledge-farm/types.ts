export type LearningMode = "quiz" | "flashcard";
export interface Species {
  kind: string;
  label: string;
  seconds: number;
  category: "crop" | "animal";
  care: string;
  product: string;
  environment: string;
  steps: string[];
  fact: string;
  source_title: string;
  source_url: string;
}
export interface QuizImage {
  url: string;
  alt_text?: string;
  caption?: string;
  position?: string;
  display_width?: string;
}
export interface Challenge {
  id: string;
  expires_at: string;
  question: {
    id: string;
    kind: LearningMode;
    prompt: string;
    options?: string[];
    images?: QuizImage[];
    option_images?: (QuizImage | null)[];
  };
}
export interface Plot {
  id: number;
  kind: string;
  ready_at: string | null;
  rest_until: string;
  retry_at: string;
  harvests: number;
  challenge?: Challenge;
}
export interface FarmView {
  state: {
    plots: Plot[];
    earned: number;
    daily_earned: number;
    reward_day: string;
  };
  catalog: Species[];
  server_time: string;
  pending_events: number;
  daily_limit: number;
  reward: number;
}
export interface AnswerResult {
  correct_option_index?: number;
  correct: boolean;
  explanation: string;
  correct_answer?: string;
  awarded: number;
  event_id?: string;
}
