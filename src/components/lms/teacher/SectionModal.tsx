import { useState } from "react";
import { Button } from "@/components/ui/button";
import lmsService from "@/services/lmsService";
import { Section } from "@/types";

export function SectionModal({ courseId, section, onClose, onSuccess, existingSections }: {
  courseId: number;
  section: Section | null;
  onClose: () => void;
  onSuccess: () => void;
  existingSections: Section[];
}) {
  const [formData, setFormData] = useState({
    title: section?.title || "",
    description: section?.description || "",
    order_index: section?.order_index ?? existingSections.length + 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (section) {
        await lmsService.updateSection(section.id, formData);
      } else {
        await lmsService.createSection(courseId, formData);
      }
      alert(section ? "Cập nhật chương thành công!" : "Tạo chương thành công!");
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || "Lỗi khi lưu chương");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{section ? "Chỉnh sửa chương" : "Thêm chương mới"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tên chương *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Thứ tự</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang lưu..." : section ? "Cập nhật" : "Tạo chương"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}