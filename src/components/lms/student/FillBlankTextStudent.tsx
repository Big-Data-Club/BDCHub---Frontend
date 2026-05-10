"use client";

import { useState, useEffect } from 'react';
import type {
  FillBlankTextStudentAnswer,
  FillBlankTextStudentProps,
} from '@/types';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

/**
 * Component for students to answer FILL_BLANK_TEXT questions
 * 
 * Features:
 * - Displays question with input fields for blanks
 * - Supports both quiz-taking and review modes
 * - Shows correct answers in review mode (if enabled)
 * - Highlights correct/incorrect answers
 * - Preserves student answers
 */
export default function FillBlankTextStudent({
  questionText,
  settings,
  value,
  onChange,
  disabled = false,
  showCorrectAnswers = false,
  correctAnswers = [],
}: FillBlankTextStudentProps) {
  const [localValue, setLocalValue] = useState<FillBlankTextStudentAnswer>(
    value || { blanks: [] }
  );

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value || { blanks: [] });
  }, [value]);

  // Parse question text to get blank positions
  const parseQuestionText = (): Array<{ type: 'text' | 'blank'; content: string; blankId?: number }> => {
    const parts: Array<{ type: 'text' | 'blank'; content: string; blankId?: number }> = [];
    const regex = /\{BLANK_(\d+)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(questionText)) !== null) {
      // Add text before blank
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: questionText.substring(lastIndex, match.index),
        });
      }

      // Add blank
      const blankId = parseInt(match[1]);
      parts.push({
        type: 'blank',
        content: match[0],
        blankId,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < questionText.length) {
      parts.push({
        type: 'text',
        content: questionText.substring(lastIndex),
      });
    }

    return parts;
  };

  // Get student answer for a blank
  const getBlankAnswer = (blankId: number): string => {
    const blank = localValue.blanks.find(b => b.blank_id === blankId);
    return blank?.answer || '';
  };

  // Update student answer for a blank
  const updateBlankAnswer = (blankId: number, answer: string) => {
    const newBlanks = localValue.blanks.filter(b => b.blank_id !== blankId);
    newBlanks.push({ blank_id: blankId, answer });

    const newValue = { blanks: newBlanks };
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Get blank config
  const getBlankConfig = (blankId: number) => {
    return settings.blanks.find(b => b.blank_id === blankId);
  };

  // Check if student answer is correct (for review mode)
  const isAnswerCorrect = (blankId: number): boolean | null => {
    if (!showCorrectAnswers || correctAnswers.length === 0) {
      return null;
    }

    const studentAnswer = getBlankAnswer(blankId).trim();
    if (!studentAnswer) return false;

    const correctAnswersForBlank = correctAnswers.filter(ca => ca.blank_id === blankId);
    if (correctAnswersForBlank.length === 0) return null;

    // Check against all correct answers for this blank
    return correctAnswersForBlank.some(ca => {
      const correctText = ca.answer_text.trim();
      const studentText = studentAnswer;

      if (ca.case_sensitive) {
        if (ca.exact_match) {
          return studentText === correctText;
        } else {
          return studentText.includes(correctText) || correctText.includes(studentText);
        }
      } else {
        const correctLower = correctText.toLowerCase();
        const studentLower = studentText.toLowerCase();
        
        if (ca.exact_match) {
          return studentLower === correctLower;
        } else {
          return studentLower.includes(correctLower) || correctLower.includes(studentLower);
        }
      }
    });
  };

  // Get correct answers for a blank (for review mode)
  const getCorrectAnswersForBlank = (blankId: number): string[] => {
    if (!showCorrectAnswers) return [];
    
    return correctAnswers
      .filter(ca => ca.blank_id === blankId)
      .map(ca => ca.answer_text);
  };

  const parts = parseQuestionText();

  return (
    <div className="space-y-4">
      {/* Question Text with Blanks */}
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <MarkdownRenderer 
                key={index} 
                content={part.content} 
                className="inline-markdown prose-p:inline prose-p:m-0" 
              />
            );
          }

          // Render blank input
          const blankId = part.blankId!;
          const config = getBlankConfig(blankId);
          const studentAnswer = getBlankAnswer(blankId);
          const isCorrect = isAnswerCorrect(blankId);

          return (
            <span key={index} className="inline-block mx-1">
              {/* Input Field */}
              <input
                type="text"
                value={studentAnswer}
                onChange={(e) => updateBlankAnswer(blankId, e.target.value)}
                disabled={disabled}
                placeholder={config?.placeholder || `Blank ${blankId}`}
                className={`
                  inline-block px-3 py-1 border-2 rounded-xl
                  transition-all duration-200
                  min-w-[120px] max-w-[300px]
                  ${disabled ? 'bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : 'bg-white dark:bg-slate-900'}
                  ${
                    isCorrect === null
                      ? 'border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50'
                      : isCorrect
                      ? 'border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  }
                `}
              />
              
              {/* Review Mode: Show indicator */}
              {disabled && isCorrect !== null && (
                <span className="ml-2 inline-flex items-center">
                  {isCorrect ? (
                    <span className="text-green-600 font-bold text-xl">✓</span>
                  ) : (
                    <span className="text-red-600 font-bold text-xl">✗</span>
                  )}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Review Mode: Show correct answers */}
      {showCorrectAnswers && settings.blanks.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">Đáp án đúng:</h4>
          
          {settings.blanks.map((blank) => {
            const correctAnswersList = getCorrectAnswersForBlank(blank.blank_id);
            const studentAnswer = getBlankAnswer(blank.blank_id);
            const isCorrect = isAnswerCorrect(blank.blank_id);

            if (correctAnswersList.length === 0) return null;

            return (
              <div
                key={blank.blank_id}
                className={`p-3 rounded-xl border-2 ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                      BLANK_{blank.blank_id}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {/* Student Answer */}
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Câu trả lời của bạn:</p>
                      <p className={`font-medium ${
                        isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {studentAnswer || <span className="italic text-slate-400 dark:text-slate-600">Chưa trả lời</span>}
                      </p>
                    </div>

                    {/* Correct Answers */}
                    {!isCorrect && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Đáp án đúng:</p>
                        <div className="space-y-1">
                          {correctAnswersList.map((ans, idx) => (
                            <p key={idx} className="text-green-700 font-medium">
                              • {ans}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">✗</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Taking Mode: Show labels/hints */}
      {!disabled && !showCorrectAnswers && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>💡 Gợi ý:</strong> Điền vào các ô trống trong câu trên
          </p>
          {settings.blanks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {settings.blanks.map(blank => (
                <span
                  key={blank.blank_id}
                  className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-blue-300 dark:border-blue-700 text-slate-700 dark:text-slate-300"
                >
                  <strong>BLANK_{blank.blank_id}:</strong> {blank.label || `Chỗ trống ${blank.blank_id}`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}