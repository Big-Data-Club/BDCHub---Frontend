"use client";

export interface QuizSettings {
  title: string;
  description?: string;
  instructions?: string;
  time_limit_minutes?: number;
  available_from?: string;
  available_until?: string;
  max_attempts?: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  passing_score?: number;
  total_points: number;
  auto_grade: boolean;
  show_results_immediately: boolean;
  show_correct_answers: boolean;
  allow_review: boolean;
  show_feedback: boolean;
  is_published: boolean,
}

interface QuizSettingsFormProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
  disabled?: boolean;
}

export default function QuizSettingsForm({
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
      {/* Basic Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-2">
          📝 Thông tin cơ bản
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Hướng dẫn làm bài
          </label>
          <textarea
            value={settings.instructions || ""}
            onChange={(e) => updateSetting("instructions", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            rows={3}
            placeholder="Nhập hướng dẫn cho học viên (tùy chọn)..."
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tổng điểm *
          </label>
          <input
            type="number"
            value={settings.total_points}
            onChange={(e) => updateSetting("total_points", parseFloat(e.target.value) || 100)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            min="0"
            step="0.01"
            required
            disabled={disabled}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tổng điểm tối đa của quiz (mặc định: 100)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Điểm qua môn (%)
          </label>
          <input
            type="number"
            value={settings.passing_score || ""}
            onChange={(e) => updateSetting("passing_score", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            min="0"
            max="100"
            step="0.01"
            placeholder="Ví dụ: 70 (tùy chọn)"
            disabled={disabled}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phần trăm điểm tối thiểu để đạt (để trống nếu không yêu cầu)
          </p>
        </div>
      </div>

      {/* Time Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-2">
          ⏱️ Cài đặt thời gian
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Giới hạn thời gian (phút)
          </label>
          <input
            type="number"
            value={settings.time_limit_minutes || ""}
            onChange={(e) => updateSetting("time_limit_minutes", e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            min="1"
            placeholder="Không giới hạn (tùy chọn)"
            disabled={disabled}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thời gian tối đa để hoàn thành quiz (để trống = không giới hạn)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mở từ ngày
            </label>
            <input
              type="datetime-local"
              value={settings.available_from || ""}
              onChange={(e) => updateSetting("available_from", e.target.value || undefined)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Đóng vào ngày
            </label>
            <input
              type="datetime-local"
              value={settings.available_until || ""}
              onChange={(e) => updateSetting("available_until", e.target.value || undefined)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Attempt Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-2">
          🔄 Cài đặt lượt làm bài
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Số lượt làm bài tối đa
          </label>
          <input
            type="number"
            value={settings.max_attempts || ""}
            onChange={(e) => updateSetting("max_attempts", e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            min="1"
            placeholder="Không giới hạn (tùy chọn)"
            disabled={disabled}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Số lần học viên được làm quiz (để trống = không giới hạn)
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.shuffle_questions}
              onChange={(e) => updateSetting("shuffle_questions", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              🔀 Xáo trộn thứ tự câu hỏi
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.shuffle_answers}
              onChange={(e) => updateSetting("shuffle_answers", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              🔀 Xáo trộn thứ tự đáp án
            </span>
          </label>
        </div>
      </div>

      {/* Grading Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-200 dark:border-slate-800 pb-2">
          ✅ Cài đặt chấm điểm
        </h3>

        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.auto_grade}
              onChange={(e) => updateSetting("auto_grade", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              ⚡ Tự động chấm điểm câu trắc nghiệm
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_results_immediately}
              onChange={(e) => updateSetting("show_results_immediately", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              📊 Hiển thị kết quả ngay sau khi nộp bài
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_correct_answers}
              onChange={(e) => updateSetting("show_correct_answers", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              ✓ Hiển thị đáp án đúng sau khi nộp
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allow_review}
              onChange={(e) => updateSetting("allow_review", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              👁️ Cho phép xem lại bài làm
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_feedback}
              onChange={(e) => updateSetting("show_feedback", e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              💬 Hiển thị giải thích/phản hồi cho câu hỏi
            </span>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>💡 Lưu ý:</strong> Sau khi tạo quiz, bạn cần vào Quản lý Quiz
          để thêm câu hỏi. Quiz chưa có câu hỏi sẽ không thể làm bài được.
        </p>
      </div>
    </div>
  );
}