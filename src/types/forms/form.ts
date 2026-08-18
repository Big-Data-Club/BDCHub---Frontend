import { ContentType, FileInfo } from "../lms/course";

// ─── Content Form ─────────────────────────────────────────────────────────────

export interface ContentFormState {
  type: ContentType;
  title: string;
  description: string;
  order_index: number;
  is_mandatory: boolean;
  metadata: Record<string, any>;
}

export interface ContentFormProps {
  /** Full form state owned by ContentModal */
  formData: ContentFormState;
  /** Called whenever a field changes */
  onChange: (updates: Partial<ContentFormState>) => void;
  /** Called when a file upload completes successfully */
  onFileUploaded: (fileInfo: FileInfo) => void;
  /** Disable all inputs while a submission is in progress */
  disabled?: boolean;
}

// ─── Survey & Dynamic Forms ───────────────────────────────────────────────────

export interface Question {
  id: string;
  type:
    | "single"
    | "multiple"
    | "short"
    | "long"
    | "number"
    | "rating"
    | "date"
    | "datetime"
    | "time"
    | "email"
    | "code"
    | "fillblank"
    | "matching";
  question: string;
  required: boolean;
  note?: string;
  placeholder?: string;
  options?: string[];
  constraints?: {
    min?: number;
    max?: number;
    minChoices?: number;
    maxChoices?: number;
    maxLength?: number;
    step?: number;
  };
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
  blanks?: Array<{
    id: string;
    label: string;
    placeholder?: string;
  }>;
  items?: Array<{
    id: string;
    text: string;
  }>;
  categories?: string[];
  language?: string;
  dateType?: "date" | "datetime" | "time";
  correctAnswer?: any;
  points?: number;
}

export interface FormConfig {
  formId: string;
  formTitle: string;
  formDescription: string;
  formType: "survey" | "quiz";
  sheetName: string;
  thankYouMessage: string;
  allowMultipleSubmissions: boolean;
  timeLimit?: number;
  passingScore?: number;
  questions: Question[];
}

export interface FormSubmission {
  formId: string;
  formTitle: string;
  sheetName: string;
  formType: string;
  questions: Question[];
  answers: Record<string, any>;
  submittedAt: string;
  userAgent?: string;
  score?: {
    total: number;
    max: number;
    percentage: number;
  };
}
