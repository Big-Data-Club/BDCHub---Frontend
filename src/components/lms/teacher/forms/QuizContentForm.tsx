"use client";

import QuizSettingsForm, { QuizSettings } from "@/components/lms/teacher/QuizSettingsForm";
import type { ContentFormProps } from "@/types";

interface QuizContentFormProps extends ContentFormProps {
  quizSettings: QuizSettings;
  onQuizSettingsChange: (s: QuizSettings) => void;
}

/**
 * QuizContentForm
 *
 * Delegates entirely to QuizSettingsForm which handles all quiz-specific
 * fields (time limit, attempts, shuffle, grading options…).
 */
export function QuizContentForm({
  disabled,
  quizSettings,
  onQuizSettingsChange,
}: QuizContentFormProps) {
  return (
    <QuizSettingsForm
      settings={quizSettings}
      onChange={onQuizSettingsChange}
      disabled={disabled}
    />
  );
}
