export interface LearningScope {
  whole_course: boolean;
  section_ids: number[];
  content_ids: number[];
}

export interface LearningScopeSection {
  id: number;
  title: string;
  contents: { id: number; title: string; type: string }[];
}
