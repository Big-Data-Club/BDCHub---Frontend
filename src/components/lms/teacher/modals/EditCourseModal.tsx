import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import BaseModal from "@/components/lms/shared/BaseModal";
import { Select } from "@/components/lms/shared/Select";
import lmsService from "@/services/lms/lmsService";
import { organizationService } from "@/services/admin/organizationService";
import { Course, FileInfo, Organization } from "@/types";
import { toast } from "sonner";

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
      toast.success("Cập nhật khóa học thành công!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">Chỉnh sửa khóa học</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Cập nhật thông tin tổng quan và thiết lập quyền truy cập</div>
          </div>
        </div>
      }
      size="xl"
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium text-sm transition-all duration-200"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-xl shadow-sm active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tên khóa học <span className="text-red-500 dark:text-red-400">*</span></label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm resize-none"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Danh mục</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-blue-500/20 rounded-xl bg-slate-50 dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#0A1628] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 focus:border-blue-500 dark:focus:border-cyan-400/50 transition-all text-sm"
            />
          </div>
          <Select
            label="Mức độ"
            value={formData.level}
            onValueChange={(val) => setFormData({ ...formData, level: val })}
            options={[
              { value: "BEGINNER", label: "Cơ bản" },
              { value: "INTERMEDIATE", label: "Trung cấp" },
              { value: "ADVANCED", label: "Nâng cao" },
              { value: "ALL_LEVELS", label: "Mọi cấp độ" },
            ]}
          />
        </div>
        {/* Organization Select */}
        <div>
          {orgLoading ? (
            <div className="text-xs text-slate-500 animate-pulse py-2">Đang tải danh sách tổ chức...</div>
          ) : (
            <Select
              label="Tổ chức sở hữu"
              required
              value={formData.org_id ? String(formData.org_id) : ""}
              onValueChange={(val) => setFormData({ ...formData, org_id: val ? Number(val) : undefined })}
              placeholder={orgs.length === 0 ? "Không thuộc tổ chức nào (Mặc định: Big Data Club)" : "Chọn tổ chức..."}
              options={orgs.map((org) => ({
                value: String(org.id),
                label: `${org.name} (${org.slug})`,
              }))}
            />
          )}
        </div>
        {/* Visibility Select */}
        <Select
          label="Khả năng hiển thị"
          value={formData.visibility}
          onValueChange={(val) => setFormData({ ...formData, visibility: val as "PUBLIC" | "ORG_ONLY" })}
          options={[
            { value: "PUBLIC", label: "Công khai - Tất cả học viên" },
            { value: "ORG_ONLY", label: "Nội bộ - Chỉ thành viên tổ chức" },
          ]}
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Ảnh đại diện</label>
          <FileUpload
            fileType="image"
            maxSize={10}
            disabled={loading}
            onFileUploaded={(fileInfo: FileInfo) => {
              setFormData((current) => ({ ...current, thumbnail_url: fileInfo.file_url }));
            }}
          />
          {formData.thumbnail_url && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800/40 bg-green-50/80 dark:bg-green-950/20 p-3 text-xs text-green-700 dark:text-green-400 font-medium">
              <span className="min-w-0 flex-1 truncate">✓ Đã tải lên ảnh đại diện</span>
              <button
                type="button"
                onClick={() => setFormData((current) => ({ ...current, thumbnail_url: "" }))}
                className="hover:underline text-green-800 dark:text-green-300"
              >
                Xóa ảnh
              </button>
            </div>
          )}
        </div>
      </form>
    </BaseModal>
  );
}

export default EditCourseModal;
