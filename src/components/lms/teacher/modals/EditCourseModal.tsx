import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import lmsService from "@/services/lms/lmsService";
import { organizationService } from "@/services/admin/organizationService";
import { Course, FileInfo, Organization } from "@/types";

export function EditCourseModal({ course, onClose, onSuccess }: {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || "",
    category: course.category || "",
    level: course.level || "BEGINNER",
    thumbnail_url: course.thumbnail_url || "",
    visibility: course.visibility || "PUBLIC" as "PUBLIC" | "ORG_ONLY",
    org_id: course.org_id || undefined as number | undefined,
  });
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onClose]);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        setOrgLoading(true);
        const list = await organizationService.getMyOrgs();
        setOrgs(list);
      } catch (err) {
        console.error("Failed to load organizations:", err);
      } finally {
        setOrgLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await lmsService.updateCourse(course.id, {
        title: formData.title || undefined,
        description: formData.description || undefined,
        category: formData.category || undefined,
        level: formData.level || undefined,
        thumbnail_url: formData.thumbnail_url || undefined,
        visibility: formData.visibility,
        org_id: formData.org_id,
      });
      alert("Cập nhật khóa học thành công!");
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || "Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#0F1E35] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-blue-500/20 shadow-2xl animate-in zoom-in-95 duration-200 my-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Chỉnh sửa khóa học</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tên khóa học *</label>
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
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Danh mục</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mức độ</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BEGINNER">Cơ bản</option>
                  <option value="INTERMEDIATE">Trung cấp</option>
                  <option value="ADVANCED">Nâng cao</option>
                  <option value="ALL_LEVELS">Mọi cấp độ</option>
                </select>
              </div>
            </div>
            {/* Organization Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tổ chức sở hữu *</label>
              {orgLoading ? (
                <div className="text-sm text-slate-500 animate-pulse py-2">Đang tải danh sách tổ chức...</div>
              ) : (
                <select
                  value={formData.org_id || ""}
                  onChange={(e) => setFormData({ ...formData, org_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  {orgs.length === 0 ? (
                    <option value="">Không thuộc tổ chức nào (Mặc định: Big Data Club)</option>
                  ) : (
                    orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.slug})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
            {/* Visibility Select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Khả năng hiển thị</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as "PUBLIC" | "ORG_ONLY" })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              >
                <option value="PUBLIC">🌐 Public - Ai cũng có thể đăng ký</option>
                <option value="ORG_ONLY">🔒 Chỉ thành viên tổ chức</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ảnh đại diện</label>
              <FileUpload
                fileType="image"
                maxSize={10}
                disabled={loading}
                onFileUploaded={(fileInfo: FileInfo) => {
                  setFormData((current) => ({ ...current, thumbnail_url: fileInfo.file_url }));
                }}
              />
              {formData.thumbnail_url && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400">
                  <span className="min-w-0 flex-1 truncate">✓ Đã có ảnh đại diện</span>
                  <button
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, thumbnail_url: "" }))}
                    className="font-medium hover:text-green-900 dark:hover:text-green-200"
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
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
    </div>,
    document.body
  );
}
