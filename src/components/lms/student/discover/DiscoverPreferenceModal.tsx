import { useEffect } from "react";
import { Sparkles, Save, X, Plus } from "lucide-react";
import { PrimaryBtn, SecondaryBtn, Input, Select } from "@/components/lms/shared";

interface DiscoverPreferenceModalProps {
  open: boolean;
  onClose: () => void;
  preferenceCategories: string;
  onCategoriesChange: (val: string) => void;
  preferenceGoal: string;
  onGoalChange: (val: string) => void;
  preferenceLevel: "" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  onLevelChange: (val: "" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED") => void;
  savingPreferences: boolean;
  onSave: () => void;
}

const POPULAR_SUGGESTIONS = ["Python", "Data Science", "AI / ML", "React", "Big Data", "Cloud Computing"];

export function DiscoverPreferenceModal({
  open,
  onClose,
  preferenceCategories,
  onCategoriesChange,
  preferenceGoal,
  onGoalChange,
  preferenceLevel,
  onLevelChange,
  savingPreferences,
  onSave,
}: DiscoverPreferenceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleAddSuggestion = (suggestion: string) => {
    const currentList = preferenceCategories
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!currentList.includes(suggestion)) {
      onCategoriesChange(currentList.concat(suggestion).join(", "));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-white dark:bg-[#0F1E35] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-blue-500/15 space-y-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Cài đặt mục tiêu học tập AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cung cấp sở thích & định hướng để thuật toán đề xuất khóa học tối ưu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Đóng modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Lĩnh vực quan tâm
            </label>
            <Input
              value={preferenceCategories}
              onChange={(e) => onCategoriesChange(e.target.value)}
              placeholder="VD: Python, Data Science, AI, React"
            />
            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1">
                Gợi ý nhanh:
              </span>
              {POPULAR_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddSuggestion(tag)}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-[#0D192E] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#162644] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Mục tiêu nghề nghiệp
            </label>
            <Input
              value={preferenceGoal}
              onChange={(e) => onGoalChange(e.target.value)}
              placeholder="VD: Trở thành Data Engineer, AI Researcher, Fullstack Dev..."
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Giúp hệ thống ưu tiên các khóa học sát với yêu cầu vị trí bạn định hướng.
            </p>
          </div>

          <div>
            <Select
              label="Trình độ hiện tại"
              size="sm"
              value={preferenceLevel || "ALL"}
              onValueChange={(val) =>
                onLevelChange(val === "ALL" ? "" : (val as "" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED"))
              }
              options={[
                { value: "ALL", label: "Chưa xác định / Mọi trình độ" },
                { value: "BEGINNER", label: "Cơ bản (Beginner)" },
                { value: "INTERMEDIATE", label: "Trung cấp (Intermediate)" },
                { value: "ADVANCED", label: "Nâng cao (Advanced)" },
              ]}
              placeholder="Chọn trình độ..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-blue-500/10">
          <SecondaryBtn onClick={onClose} disabled={savingPreferences}>
            Hủy
          </SecondaryBtn>
          <PrimaryBtn
            onClick={onSave}
            loading={savingPreferences}
            icon={<Save className="w-4 h-4" />}
          >
            Lưu thiết lập
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}


