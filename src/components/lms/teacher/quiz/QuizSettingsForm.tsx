"use client";

/**
 * QuizSettingsForm
 *
 * Owned component for configuring Quiz settings (time limit, attempts,
 * grading options, visibility, etc.). Used inside ContentModal (when
 * type="QUIZ") and EditContentModal, as well as standalone quiz edit pages.
 */

import React from "react";
import { FileText, RotateCcw, CheckCircle2, HelpCircle } from "lucide-react";

export interface QuizSettings {
  title: string;
  description?: string;
  instructions?: string;
  time_limit_minutes?: number;
  available_from?: string;
  available_until?: string;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_answers?: boolean;
  passing_score?: number;
  total_points?: number;
  auto_grade?: boolean;
  show_results_immediately?: boolean;
  show_correct_answers?: boolean;
  allow_review?: boolean;
  show_feedback?: boolean;
  is_published?: boolean;
}

interface QuizSettingsFormProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
  disabled?: boolean;
}

export function QuizSettingsForm({
  settings,
  onChange,
  disabled = false,
}: QuizSettingsFormProps) {
  const updateSetting = <K extends keyof QuizSettings>(
    key: K,
    value: QuizSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-blue-500/10">
          <FileText className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Thông tin cơ bản</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Thời gian làm bài (Phút)
            </label>
            <input
              type="number"
              value={settings.time_limit_minutes || ""}
              onChange={(e) =>
                updateSetting(
                  "time_limit_minutes",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="Không giới hạn"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
              min={1}
              disabled={disabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Điểm đạt (%)
            </label>
            <input
              type="number"
              value={settings.passing_score || ""}
              onChange={(e) =>
                updateSetting(
                  "passing_score",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="VD: 80"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
              min={0}
              max={100}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Thời gian mở đề
            </label>
            <input
              type="datetime-local"
              value={settings.available_from || ""}
              onChange={(e) =>
                updateSetting(
                  "available_from",
                  e.target.value ? e.target.value : undefined
                )
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
              disabled={disabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Thời gian đóng đề
            </label>
            <input
              type="datetime-local"
              value={settings.available_until || ""}
              onChange={(e) =>
                updateSetting(
                  "available_until",
                  e.target.value ? e.target.value : undefined
                )
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Hướng dẫn làm bài
          </label>
          <textarea
            value={settings.instructions || ""}
            onChange={(e) => updateSetting("instructions", e.target.value)}
            placeholder="Nhập hướng dẫn chi tiết cho học viên trước khi bắt đầu bài kiểm tra..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm resize-none"
            rows={3}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Cài đặt lượt làm bài */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-blue-500/10">
          <RotateCcw className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Cài đặt lượt làm bài</span>
        </h4>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Số lần làm bài tối đa
            </label>
            <input
              type="number"
              value={settings.max_attempts || ""}
              onChange={(e) =>
                updateSetting(
                  "max_attempts",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="Không giới hạn"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-500/20 bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
              min={1}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.shuffle_questions}
                onChange={(e) => updateSetting("shuffle_questions", e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#0D192E]"
                disabled={disabled}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Xáo trộn thứ tự câu hỏi
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.shuffle_answers}
                onChange={(e) => updateSetting("shuffle_answers", e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#0D192E]"
                disabled={disabled}
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Xáo trộn thứ tự đáp án
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Cài đặt chấm điểm */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-blue-500/10">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Cài đặt chấm điểm & phản hồi</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.auto_grade}
              onChange={(e) => updateSetting("auto_grade", e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#0D192E]"
              disabled={disabled}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tự động chấm điểm câu trắc nghiệm
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.show_results_immediately}
              onChange={(e) => updateSetting("show_results_immediately", e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#0D192E]"
              disabled={disabled}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Hiển thị kết quả ngay sau khi nộp
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.show_correct_answers}
              onChange={(e) => updateSetting("show_correct_answers", e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#0D192E]"
              disabled={disabled}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Hiển thị đáp án đúng sau khi nộp
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.allow_review}
              onChange={(e) => updateSetting("allow_review", e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#0D192E]"
              disabled={disabled}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Cho phép xem lại bài làm
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none md:col-span-2">
            <input
              type="checkbox"
              checked={settings.show_feedback}
              onChange={(e) => updateSetting("show_feedback", e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-[#0D192E]"
              disabled={disabled}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Hiển thị giải thích / phản hồi chi tiết
            </span>
          </label>
        </div>

        <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-center gap-2.5 text-xs text-blue-800 dark:text-cyan-300">
          <HelpCircle className="w-4 h-4 shrink-0 text-blue-600 dark:text-cyan-400" />
          <span>Lưu ý: Sau khi tạo Quiz, bạn có thể vào trang Quản lý Quiz để biên soạn danh sách câu hỏi.</span>
        </div>
      </div>
    </div>
  );
}

export default QuizSettingsForm;