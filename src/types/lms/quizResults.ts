export interface QuizResultAttempt {
  id: number;
  student_id: number;
  student_name: string;
  attempt_number: number;
  started_at: string;
  submitted_at: string | null;
  status: string;
  percentage: number | null;
  total_points: number | null;
  earned_points: number | null;
  is_passed: boolean | null;
  time_spent_seconds: number | null;
  pending_answers: number;
  focus_summary: { departures: number; away_seconds: number } | null;
}
export interface QuizResultQuestion {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order_index: number;
  answered: number;
  correct: number;
  incorrect: number;
  pending: number;
  answer_options: {
    id: number;
    option_text: string;
    is_correct: boolean;
    selected_count: number;
  }[];
  correct_answers: { answer_text: string | null; blank_id: number | null }[];
  average_points: number | null;
  average_seconds: number | null;
}
export interface QuizResults {
  summary: QuizResultsSummary;
  students: QuizResultStudent[];
  distribution: { bucket: number; count: number }[];
  attempts_total: number;
  students_total: number;
  page_size: number;
  attempt_page: number;
  student_page: number;
  quiz_id: number;
  title: string;
  attempts: QuizResultAttempt[];
  questions: QuizResultQuestion[];
}
export interface QuizInsights {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  limitations: string[];
}
export interface QuizResultAnswer {
  id: number;
  question_id: number;
  answer_data: Record<string, unknown>;
  points_earned: number | null;
  is_correct: boolean | null;
  grader_feedback?: string;
}

export interface QuizResultsSummary {
  total_attempts: number;
  unique_students: number;
  submitted_attempts: number;
  pending_attempts: number;
  pending_answers: number;
  graded_attempts: number;
  average_percentage: number | null;
  minimum_percentage: number | null;
  maximum_percentage: number | null;
  median_percentage: number | null;
  pass_rate: number | null;
  focus_available_attempts: number;
  total_departures: number;
  total_away_seconds: number;
  average_seconds: number | null;
}
export interface QuizResultStudent {
  student_id: number;
  student_name: string;
  total_attempts: number;
  submitted_attempts: number;
  best_percentage: number | null;
  average_percentage: number | null;
  latest_attempt_id: number;
  latest_attempt: QuizResultAttempt;
}
