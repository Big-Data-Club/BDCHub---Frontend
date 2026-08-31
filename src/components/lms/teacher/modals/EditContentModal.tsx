"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import QuizSettingsForm, { QuizSettings } from "../quiz/QuizSettingsForm";
import BaseModal from "@/components/lms/shared/BaseModal";
import AIRevisionPanel from "@/components/lms/teacher/AIRevisionPanel";

import lmsService from "@/services/lms/lmsService";
import quizService from "@/services/lms/quizService";
import { Content, FileInfo } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditContentModalProps {
  content: Content;
  onClose: () => void;
  onSuccess: (content: Content) => void;
}

export default function EditContentModal({
  content,
  onClose,
  onSuccess,
}: EditContentModalProps) {
  const [formData, setFormData] = useState({
    title: content.title,
    description: content.description,
    order_index: content.order_index,
    is_mandatory: content.is_mandatory,
    metadata: content.metadata || {},
  });

  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [textContent, setTextContent] = useState(
    content.metadata?.content || ""
  );
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [removeFileConfirm, setRemoveFileConfirm] = useState(false);
  const router = useRouter();


  const loadQuizSettings = useCallback(async () => {
    try {
      setLoadingQuiz(true);
      const response = await quizService.getQuizByContentId(content.id);
      
      if (response.data) {
        const quiz = response.data;
        setQuizId(quiz.id);
        
        // Convert quiz data to QuizSettings format
        setQuizSettings({
          title: quiz.title,
          description: quiz.description || "",
          instructions: quiz.instructions || "",
          time_limit_minutes: quiz.time_limit_minutes || undefined,
          available_from: quiz.available_from 
            ? new Date(quiz.available_from).toISOString().slice(0, 16) 
            : undefined,
          available_until: quiz.available_until 
            ? new Date(quiz.available_until).toISOString().slice(0, 16) 
            : undefined,
          max_attempts: quiz.max_attempts || undefined,
          shuffle_questions: quiz.shuffle_questions || false,
          shuffle_answers: quiz.shuffle_answers || false,
          passing_score: quiz.passing_score || undefined,
          total_points: quiz.total_points || 100,
          auto_grade: quiz.auto_grade ?? true,
          show_results_immediately: quiz.show_results_immediately ?? true,
          show_correct_answers: quiz.show_correct_answers ?? true,
          allow_review: quiz.allow_review ?? true,
          show_feedback: quiz.show_feedback ?? true,
          is_published: quiz.is_published ?? false,
        });
      }
    } catch (error: any) {
      console.error("Error loading quiz:", error);
      // Quiz might not exist yet, that's ok
      setQuizSettings({
        title: content.title,
        description: content.description || "",
        instructions: "",
        time_limit_minutes: undefined,
        available_from: undefined,
        available_until: undefined,
        max_attempts: undefined,
        shuffle_questions: false,
        shuffle_answers: false,
        passing_score: undefined,
        total_points: 100,
        auto_grade: true,
        show_results_immediately: true,
        show_correct_answers: true,
        allow_review: true,
        show_feedback: true,
        is_published: false,
      });
    } finally {
      setLoadingQuiz(false);
    }
  }, [content.id, content.title, content.description]);

  useEffect(() => {
    if (content.type === "QUIZ") {
      loadQuizSettings();
    }
  }, [content.id, content.type, loadQuizSettings]);

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TEXT: "Văn bản",
      VIDEO: "Video",
      DOCUMENT: "Tài liệu",
      IMAGE: "Hình ảnh",
      QUIZ: "Quiz",
      FORUM: "Diễn đàn",
      ANNOUNCEMENT: "Thông báo",
    };
    return labels[type] || type;
  };

  const getFileUploadType = (contentType: string): "video" | "document" | "image" => {
    switch (contentType) {
      case "VIDEO":
        return "video";
      case "IMAGE":
        return "image";
      case "DOCUMENT":
        return "document";
      default:
        return "document";
    }
  };

  const handleFileUploaded = (fileInfo: FileInfo) => {
    setUploadedFile(fileInfo);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        file_path: fileInfo.file_path,
        file_name: fileInfo.file_name,
        file_size: fileInfo.file_size,
        file_id: fileInfo.file_id,
      },
    });
    setShowFileUpload(false);
  };

  const removeCurrentFile = () => {
    setUploadedFile(null);
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        file_path: undefined,
        file_name: undefined,
        file_size: undefined,
        file_id: undefined,
      },
    });
    setRemoveFileConfirm(false);
  };

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
    if (content.type === "QUIZ" && quizSettings) {
      setQuizSettings({ ...quizSettings, title });
    }
  };

  const handleDescriptionChange = (description: string) => {
    setFormData({ ...formData, description });
    if (content.type === "QUIZ" && quizSettings) {
      setQuizSettings({ ...quizSettings, description });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const metadata = { ...formData.metadata };

    if (content.type === "TEXT") {
      metadata.content = textContent;
    } else if (content.type === "QUIZ" && quizSettings) {
      metadata.quiz_settings = quizSettings;
    }

    try {
      setLoading(true);
      
      // Update content
      await lmsService.updateContent(content.id, {
        ...formData,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });

      // If it's a quiz, update or create quiz record
      if (content.type === "QUIZ" && quizSettings) {
        try {
          const formatDateTimeForBackend = (dateTimeString: string | undefined) => {
            if (!dateTimeString) return undefined;
            
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return undefined;
            
            return date.toISOString();
          };

          const cleanQuizSettings = {
            ...(quizSettings.title && { title: quizSettings.title }),
            ...(quizSettings.description && { description: quizSettings.description }),
            ...(quizSettings.instructions && { instructions: quizSettings.instructions }),
            ...(quizSettings.time_limit_minutes !== undefined && { 
              time_limit_minutes: quizSettings.time_limit_minutes 
            }),
            ...(quizSettings.available_from && { 
              available_from: formatDateTimeForBackend(quizSettings.available_from) 
            }),
            ...(quizSettings.available_until && { 
              available_until: formatDateTimeForBackend(quizSettings.available_until) 
            }),
            ...(quizSettings.max_attempts !== undefined && { 
              max_attempts: quizSettings.max_attempts 
            }),
            ...(quizSettings.shuffle_questions !== undefined && { 
              shuffle_questions: quizSettings.shuffle_questions 
            }),
            ...(quizSettings.shuffle_answers !== undefined && { 
              shuffle_answers: quizSettings.shuffle_answers 
            }),
            ...(quizSettings.passing_score !== undefined && { 
              passing_score: quizSettings.passing_score 
            }),
            ...(quizSettings.total_points !== undefined && { 
              total_points: quizSettings.total_points 
            }),
            ...(quizSettings.auto_grade !== undefined && { 
              auto_grade: quizSettings.auto_grade 
            }),
            ...(quizSettings.show_results_immediately !== undefined && { 
              show_results_immediately: quizSettings.show_results_immediately 
            }),
            ...(quizSettings.show_correct_answers !== undefined && { 
              show_correct_answers: quizSettings.show_correct_answers 
            }),
            ...(quizSettings.allow_review !== undefined && { 
              allow_review: quizSettings.allow_review 
            }),
            ...(quizSettings.show_feedback !== undefined && { 
              show_feedback: quizSettings.show_feedback 
            }),
            ...(quizSettings.is_published !== undefined && { 
              is_published: quizSettings.is_published 
            }),
          };

          if (quizId) {
            await quizService.updateQuiz(quizId, cleanQuizSettings);
          } else {
            await quizService.createQuizWithContent(content.id, cleanQuizSettings);
          }
        } catch (quizError: any) {
          console.error("Error updating quiz:", quizError);
          console.error("Error details:", quizError.response?.data);
          toast.error(
            "Nội dung đã được cập nhật nhưng có lỗi khi cập nhật quiz settings: " +
              (quizError.response?.data?.message || quizError.message)
          );
        }
      }

      toast.success("Cập nhật nội dung thành công!");
      onSuccess({
        ...content,
        ...formData,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      });
    } catch (error: any) {
      console.error("Error updating content:", error);
      toast.error(error.response?.data?.error || "Lỗi khi cập nhật nội dung");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const currentFile =
    uploadedFile ||
    (formData.metadata?.file_path
      ? {
          file_id: formData.metadata.file_id || "",
          file_name: formData.metadata.file_name || "",
          file_path: formData.metadata.file_path,
          file_url: "",
          file_size: formData.metadata.file_size || 0,
          file_type: content.type,
        }
      : null);

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Chỉnh sửa nội dung"
      description={`${getContentTypeLabel(content.type)} - ${content.title}`}
      size="xl"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || loadingQuiz}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Đang cập nhật..." : "✓ Cập nhật"}
          </Button>
          {content.type === "QUIZ" && quizId && (
            <Button
              type="button"
              onClick={() => router.push(`/lms/teacher/quiz/${quizId}/manage`)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              📝 Quản lý Quiz
            </Button>
          )}
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-750 disabled:opacity-50"
          >
            Hủy
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Loại nội dung:</strong> {getContentTypeLabel(content.type)}
            <br />
            <strong>Ngày tạo:</strong>{" "}
            {new Date(content?.updated_at || "").toLocaleDateString("vi-VN")}
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tiêu đề *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* QUIZ Settings */}
        {content.type === "QUIZ" && quizSettings && (
          <div className="border-t dark:border-slate-800 pt-4">
            {loadingQuiz ? (
              <div className="text-center py-4">
                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                  Đang tải cài đặt quiz...
                </p>
              </div>
            ) : (
              <>
                <AIRevisionPanel
                  kind="quiz"
                  label="AI chỉnh sửa cài đặt quiz"
                  source={{
                    title: quizSettings.title, description: quizSettings.description,
                    instructions: quizSettings.instructions,
                    time_limit_minutes: quizSettings.time_limit_minutes,
                    max_attempts: quizSettings.max_attempts,
                    passing_score: quizSettings.passing_score,
                    shuffle_questions: quizSettings.shuffle_questions,
                    shuffle_answers: quizSettings.shuffle_answers,
                    auto_grade: quizSettings.auto_grade,
                  }}
                  onApply={(proposal) => {
                    setQuizSettings({ ...quizSettings, ...proposal } as QuizSettings);
                    if (typeof proposal.title === "string") setFormData((current) => ({ ...current, title: proposal.title as string }));
                    if (typeof proposal.description === "string") setFormData((current) => ({ ...current, description: proposal.description as string }));
                  }}
                />
                <div className="mt-4"><QuizSettingsForm settings={quizSettings} onChange={setQuizSettings} disabled={loading} /></div>
              </>
            )}
          </div>
        )}

        {/* Text Content for TEXT type */}
        {content.type === "TEXT" && (
          <div className="space-y-4">
            <AIRevisionPanel
              kind="lesson"
              label="AI chỉnh sửa bài học"
              source={{ title: formData.title, description: formData.description, markdown: textContent }}
              onApply={(proposal) => {
                setFormData((current) => ({ ...current, title: String(proposal.title ?? current.title), description: String(proposal.description ?? current.description) }));
                if (typeof proposal.markdown === "string") setTextContent(proposal.markdown);
              }}
            />
            <MarkdownEditor label="Nội dung văn bản *" value={textContent} onChange={setTextContent} placeholder="Nhập nội dung bài học..." />
          </div>
        )}

        {/* File Upload Section for File-based Content */}
        {(content.type === "VIDEO" ||
          content.type === "DOCUMENT" ||
          content.type === "IMAGE") && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                File
              </label>
              {currentFile && (
                <button
                  type="button"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {showFileUpload ? "Hủy" : "Đổi file"}
                </button>
              )}
            </div>

            {currentFile && !showFileUpload && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-lg mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                      ✓ File hiện tại
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      📁 {currentFile.file_name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      📊 {formatFileSize(currentFile.file_size)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-mono break-all">
                      {currentFile.file_path}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemoveFileConfirm(true)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>

                {removeFileConfirm && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-sm">
                    <p className="text-red-800 dark:text-red-300 font-medium mb-2">
                      Bạn có chắc muốn xóa file này?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={removeCurrentFile}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                      >
                        Xác nhận xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemoveFileConfirm(false)}
                        className="px-3 py-1 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showFileUpload && (
              <div className="mb-4">
                <FileUpload
                  fileType={getFileUploadType(content.type)}
                  onFileUploaded={handleFileUploaded}
                />
              </div>
            )}

            {!currentFile && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
              Chưa có file được tải lên
                </p>
                <FileUpload
                  fileType={getFileUploadType(content.type)}
                  onFileUploaded={handleFileUploaded}
                />
              </div>
            )}
          </div>
        )}

        {/* Order Index */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Thứ tự
          </label>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) =>
              setFormData({
                ...formData,
                order_index: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min="0"
            disabled={loading}
          />
        </div>

        {/* Mandatory Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is-mandatory"
            checked={formData.is_mandatory}
            onChange={(e) =>
              setFormData({ ...formData, is_mandatory: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-700 rounded focus:ring-blue-500 bg-white dark:bg-slate-800"
            disabled={loading}
          />
          <label
            htmlFor="is-mandatory"
            className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Nội dung bắt buộc
          </label>
        </div>

        {/* Info */}
        {content.type !== "QUIZ" && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>💡 Lưu ý:</strong> Khi bạn cập nhật file, học viên sẽ nhận
              được file mới khi họ truy cập lại nội dung. Tiêu đề và mô tả cũng
              sẽ được cập nhật ngay lập tức.
            </p>
          </div>
        )}
      </form>
    </BaseModal>
  );
}
