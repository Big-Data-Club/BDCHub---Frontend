export interface RuntimeTaskSummary {
  id: number;
  title: string;
  verifier_type: string;
  weight: number;
  is_required: boolean;
}

export interface RuntimeTaskForm {
  title: string;
  description: string;
  verifierType: string;
  path: string;
  contains: string;
  command: string;
  expected: string;
  weight: number;
  isRequired: boolean;
}
