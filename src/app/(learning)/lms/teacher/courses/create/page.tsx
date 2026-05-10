"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lmsService";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import { FileInfo } from "@/types";

const COURSE_LEVELS = [
  { value: "BEGINNER", label: "Cơ bản" },
  { value: "INTERMEDIATE", label: "Trung cấp" },
  { value: "ADVANCED", label: "Nâng cao" },
  { value: "ALL_LEVELS", label: "Mọi cấp độ" }
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "BEGINNER",
    thumbnail_url: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tên khóa học là bắt buộc";
    } else if (formData.title.length < 3) {
      newErrors.title = "Tên khóa học phải có ít nhất 3 ký tự";
    } else if (formData.title.length > 255) {
      newErrors.title = "Tên khóa học không được quá 255 ký tự";
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = "Mô tả không được quá 5000 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const result = await lmsService.createCourse({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
        level: formData.level || undefined,
        thumbnail_url: formData.thumbnail_url ? formData.thumbnail_url : undefined,
      });
      
      alert("Tạo khóa học thành công!");
      router.push(`/lms/teacher/courses/${result.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || "Lỗi khi tạo khóa học");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          ← Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Tạo khóa học mới</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Nhập thông tin chi tiết để tạo khóa học của bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            Thông tin cơ bản
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tên khóa học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Lập trình Python cơ bản"
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.title ? "border-red-500 dark:border-red-500" : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {errors.title && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mô tả khóa học
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả chi tiết về khóa học, mục tiêu học tập, đối tượng học viên..."
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.description ? "border-red-500 dark:border-red-500" : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {errors.description && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            Chi tiết khóa học
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Danh mục
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="VD: Lập trình, Thiết kế, Kinh doanh..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mức độ khó
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {COURSE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL ảnh đại diện
            </label>
            <FileUpload
              onFileUploaded={(fileInfo: FileInfo) => {
                setFormData({ ...formData, thumbnail_url: fileInfo.file_url });
              }}
              fileType="image"
              maxSize={10}
              disabled={loading}
            />
            {formData.thumbnail_url && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                <span className="text-green-700 dark:text-green-400 text-sm">✓ Đã upload ảnh thành công</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thumbnail_url: "" })}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium ml-auto"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Mẹo:</strong> Bạn có thể chỉnh sửa thông tin này sau khi tạo khóa học. 
            Khóa học sẽ được tạo ở trạng thái Nháp và bạn cần xuất bản để học viên có thể xem.
          </p>
        </div>

        <div className="flex gap-3 border-t border-slate-200 dark:border-slate-800 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo khóa học..." : "Tạo khóa học"}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}