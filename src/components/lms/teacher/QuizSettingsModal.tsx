"use client";

import { Button } from "@/components/ui/button";

export interface QuizSettings {
  id: number;
  title: string;
  description: string;
  total_points: number;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  passing_score: number | null;
  auto_grade: boolean;
  show_results_immediately: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  is_published: boolean;
}

interface Props {
  quiz: QuizSettings;
  onChange: (quiz: QuizSettings) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

/**
 * QuizSettingsModal
 *
 * Extracted from TeacherQuizManagePage — owns the ⚙️ modal UI only.
 * State (quiz) is lifted up; parent passes onChange + onSave.
 */
export function QuizSettingsModal({ quiz, onChange, onSave, onClose }: Props) {
  const set = <K extends keyof QuizSettings>(key: K, val: QuizSettings[K]) =>
    onChange({ ...quiz, [key]: val });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Cài đặt Quiz</h2>
        </div>

        <form onSubmit={onSave} className="p-6">
          <div className="space-y-5">
            {/* Numeric fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Time limit */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Thời gian (phút)
                </label>
                <input
                  type="number"
                  value={quiz.time_limit_minutes || ""}
                  onChange={e => set("time_limit_minutes", e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min="1"
                  placeholder="Không giới hạn"
                />
              </div>

              {/* Max attempts */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Số lần làm tối đa
                </label>
                <input
                  type="number"
                  value={quiz.max_attempts || ""}
                  onChange={e => set("max_attempts", e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min="1"
                  placeholder="Không giới hạn"
                />
              </div>

              {/* Passing score */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Điểm đạt (%)
                </label>
                <input
                  type="number"
                  value={quiz.passing_score || ""}
                  onChange={e => set("passing_score", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="VD: 70"
                />
              </div>

              {/* Total points */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tổng điểm
                </label>
                <input
                  type="number"
                  value={quiz.total_points}
                  onChange={e => set("total_points", parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
            </div>

            {/* Toggle flags */}
            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-5">
              {([
                ["auto_grade",               "⚡ Tự động chấm điểm"],
                ["show_results_immediately", "📊 Hiển thị kết quả ngay"],
                ["show_correct_answers",     "✓ Hiển thị đáp án đúng"],
                ["allow_review",             "👁️ Cho phép xem lại bài làm"],
              ] as [keyof QuizSettings, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!quiz[key]}
                    onChange={e => set(key, e.target.checked as any)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                </label>
              ))}

              {/* Publish toggle — highlighted */}
              <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl mt-1">
                <input
                  type="checkbox"
                  checked={quiz.is_published}
                  onChange={e => set("is_published", e.target.checked)}
                  className="w-4 h-4 rounded text-green-600 border-green-300 dark:border-green-600"
                />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  ✓ Publish quiz (học sinh có thể làm)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-95 transition-all"
            >
              Lưu cài đặt
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-all"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}