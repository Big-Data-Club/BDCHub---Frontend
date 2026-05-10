import { ContentType, FileInfo } from ".";

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