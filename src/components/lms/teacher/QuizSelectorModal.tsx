"use client";

import { useState, useEffect } from "react";
import { X, Plus, AlertCircle, Loader } from "lucide-react";
import lmsService from "@/services/lmsService";
import { lmsApiClient } from "@/services/lmsApiClient";
import { cn } from "@/lib/utils";

export interface QuizFromContent {
  id: number;
  content_id: number;
  title: string;
  description?: string;
  total_points: number;
  question_count?: number;
  is_published: boolean;
}

interface QuizSelectorModalProps {
  courseId: number;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (quizId: number) => void;
  onCreateNew?: (courseId: number) => void;
}

export function QuizSelectorModal({
  courseId,
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
}: QuizSelectorModalProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<QuizFromContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadQuizzes();
    }
  }, [isOpen, courseId]);

  const loadQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      // Get all sections of the course
      const res = await lmsService.listSections(courseId);
      const sectionsData = res.data;
      setSections(sectionsData);

      // Extract all quizzes from all sections
      const allQuizzes: QuizFromContent[] = [];
      for (const section of sectionsData) {
        try {
          const res = await lmsService.listContent(section.id);
          const contents = res.data
          const quizContents = contents.filter((c: any) => c.type === "QUIZ");
          
          for (const quizContent of quizContents) {
            try {
              // Get quiz details via the content ID
              const quizDetail = await lmsService.getContent(quizContent.id);
              
              // Make a direct request to get the actual quiz object
              // Assuming quiz_id is available in the response or we need to call getQuizByContentID
              const response = await lmsApiClient.get(
                `/content/${quizContent.id}/quiz`
              );
              const quiz = response.data?.data ?? response.data;
              
              if (quiz && quiz.id) {
                allQuizzes.push({
                  id: quiz.id,
                  content_id: quizContent.id,
                  title: quiz.title || quizContent.title,
                  description: quiz.description || quizContent.description,
                  total_points: quiz.total_points ?? 100,
                  question_count: 0, // Will be populated if available
                  is_published: quiz.is_published ?? quizContent.is_published ?? false,
                });
              }
            } catch (e) {
              console.error(`Failed to load quiz for content ${quizContent.id}:`, e);
              // Continue with next content
            }
          }
        } catch (e) {
          // Skip sections/content that fail to load
          console.error(`Failed to load content for section ${section.id}:`, e);
        }
      }
      
      setQuizzes(allQuizzes);
      if (allQuizzes.length === 0) {
        setError("Chưa có Quiz nào trong khóa học này. Vui lòng tạo Quiz trước.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Lỗi khi tải danh sách Quiz");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedQuizId) {
      onSelect(selectedQuizId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            Chọn Quiz để thêm câu hỏi
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader className="w-5 h-5 text-violet-500 animate-spin" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Đang tải danh sách Quiz…
              </p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  {error}
                </p>
                {onCreateNew && (
                  <button
                    onClick={() => {
                      onClose();
                      onCreateNew(courseId);
                    }}
                    className="text-sm text-red-700 dark:text-red-400 font-medium hover:underline"
                  >
                    Tạo Quiz mới
                  </button>
                )}
              </div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-3">📋</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Chưa có Quiz nào
              </p>
              {onCreateNew && (
                <button
                  onClick={() => {
                    onClose();
                    onCreateNew(courseId);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tạo Quiz mới
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    selectedQuizId === quiz.id
                      ? "border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/30"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={cn(
                          "font-semibold truncate",
                          selectedQuizId === quiz.id
                            ? "text-violet-900 dark:text-violet-100"
                            : "text-slate-900 dark:text-slate-50"
                        )}
                      >
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p
                          className={cn(
                            "text-sm mt-1 truncate",
                            selectedQuizId === quiz.id
                              ? "text-violet-700 dark:text-violet-300"
                              : "text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {quiz.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full",
                            quiz.is_published
                              ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                              : "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                          )}
                        >
                          {quiz.is_published ? "✓ Đã xuất bản" : "⏱ Nháp"}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full",
                            selectedQuizId === quiz.id
                              ? "bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-200"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          📊 {quiz.question_count || 0} câu
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full",
                            selectedQuizId === quiz.id
                              ? "bg-violet-200 dark:bg-violet-900 text-violet-800 dark:text-violet-200"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          ⭐ {quiz.total_points} điểm
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1",
                        selectedQuizId === quiz.id
                          ? "border-violet-600 bg-violet-600"
                          : "border-slate-300 dark:border-slate-600"
                      )}
                    >
                      {selectedQuizId === quiz.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            {onCreateNew && quizzes.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onCreateNew(courseId);
                }}
                className="px-4 py-2 text-sm font-medium text-violet-700 dark:text-violet-400 border border-violet-300 dark:border-violet-700 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo mới
              </button>
            )}
          </div>
          <button
            onClick={handleSelect}
            disabled={!selectedQuizId || loading}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}
