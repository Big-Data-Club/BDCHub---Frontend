import { Sparkles, Save, SlidersHorizontal } from "lucide-react";
import { PrimaryBtn, SecondaryBtn, Input } from "@/components/lms/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative max-w-lg w-full bg-white dark:bg-[#0F1E35] rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-blue-500/15 space-y-5 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Cài đặt mục tiêu học tập AI
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Điều chỉnh để hệ thống cá nhân hóa đề xuất khóa học phù hợp nhất với bạn.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Lĩnh vực quan tâm (cách nhau bởi dấu phẩy)
            </label>
            <Input
              value={preferenceCategories}
              onChange={(e) => onCategoriesChange(e.target.value)}
              placeholder="VD: Python, Data Science, AI, React"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Mục tiêu nghề nghiệp
            </label>
            <Input
              value={preferenceGoal}
              onChange={(e) => onGoalChange(e.target.value)}
              placeholder="VD: Trở thành Data Engineer tại Big Tech"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Trình độ hiện tại
            </label>
            <Select
              value={preferenceLevel || "ALL"}
              onValueChange={(val) =>
                onLevelChange(val === "ALL" ? "" : (val as "" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED"))
              }
            >
              <SelectTrigger className="w-full bg-slate-50 dark:bg-[#0D192E] border-slate-300 dark:border-blue-500/20 rounded-xl text-slate-900 dark:text-slate-100">
                <SelectValue placeholder="Chọn trình độ..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/20">
                <SelectItem value="ALL">Chưa xác định / Mọi trình độ</SelectItem>
                <SelectItem value="BEGINNER">Cơ bản (Beginner)</SelectItem>
                <SelectItem value="INTERMEDIATE">Trung cấp (Intermediate)</SelectItem>
                <SelectItem value="ADVANCED">Nâng cao (Advanced)</SelectItem>
              </SelectContent>
            </Select>
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
            Lưu mục tiêu
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
