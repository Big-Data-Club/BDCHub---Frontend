export interface OverviewReferenceItem {
  content_id: number;
  title: string;
  content_type: string;
}

export interface OverviewQuestionOption {
  text: string;
  is_correct: boolean;
}

export interface OverviewQuestion {
  question: string;
  options: OverviewQuestionOption[];
  explanation: string;
  bloom_level: string;
  reference_content_ids: number[];
}

export interface SectionOverviewJob {
  id: number;
  section_id: number;
  course_id: number;
  status: string; // queued | processing | completed | failed
  progress: number;
  stage: string;
  error_msg: string;
  language: string;
  question_count: number;
  logs?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface SectionOverviewLesson {
  id: number;
  job_id: number;
  section_id: number;
  course_id: number;
  title: string;
  summary: string;
  markdown_content: string;
  references: OverviewReferenceItem[];
  status: string; // draft | published
  published_content_id?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface SectionOverviewQuiz {
  id: number;
  job_id: number;
  section_id: number;
  course_id: number;
  title: string;
  summary: string;
  question_count: number;
  questions: OverviewQuestion[];
  references: OverviewReferenceItem[];
  status: string; // draft | published
  published_quiz_id?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface SectionOverviewJobDetail {
  job: SectionOverviewJob;
  lesson: SectionOverviewLesson | null;
  quiz: SectionOverviewQuiz | null;
}
