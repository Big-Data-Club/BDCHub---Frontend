"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lmsService";
import { organizationService } from "@/services/organizationService";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import { FileInfo, Organization } from "@/types";
import { CourseBlueprintWorkspace } from "@/components/lms/teacher/CourseBlueprintWorkspace";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { Input, Textarea, PrimaryBtn, SecondaryBtn, Alert, GridBackground, CourseCard, RadioTileGroup, FilterDropdown, TeacherHeader } from "@/components/lms/shared";
import { 
  ArrowLeft, BookOpen, Layers, Wand2, FileEdit, PlusCircle, Trash2, Globe, Lock, Sparkles, CheckCircle2, Award, Building2
} from "lucide-react";

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
  const [submitNotice, setSubmitNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [aiWorkflow, setAiWorkflow] = useState(false); // Manual creation by default
  const { userId } = useCurrentUser();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "BEGINNER",
    thumbnail_url: "",
    visibility: "PUBLIC" as "PUBLIC" | "ORG_ONLY",
    org_id: undefined as number | undefined,
  });

  useEffect(() => {
    async function fetchOrgs() {
      try {
        setOrgLoading(true);
        const list = await organizationService.getMyOrgs();
        setOrgs(list);
        if (list.length > 0) {
          const defaultOrg = list.find(o => o.slug === "bdc") || list[0];
          setFormData(prev => ({ ...prev, org_id: defaultOrg.id }));
        }
      } catch (err) {
        console.error("Failed to load organizations:", err);
      } finally {
        setOrgLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  const orgOptions = useMemo(() => {
    if (orgs.length === 0) {
      return [{ value: "", label: "Không thuộc tổ chức nào (Mặc định: Big Data Club)" }];
    }
    return orgs.map((org) => ({
      value: String(org.id),
      label: `${org.name} (${org.slug})`,
    }));
  }, [orgs]);

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
    setSubmitNotice(null);
    
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
        visibility: formData.visibility,
        org_id: formData.org_id,
      });
      
      setSubmitNotice({ type: "success", message: "Tạo khóa học thành công! Đang chuyển hướng..." });
      setTimeout(() => {
        router.push(`/lms/teacher/courses/${result.data.id}`);
      }, 1000);
    } catch (error: any) {
      setSubmitNotice({ 
        type: "error", 
        message: error.response?.data?.error || "Đã xảy ra lỗi khi khởi tạo khóa học. Vui lòng kiểm tra lại." 
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-[#050B18]">
      {/* ── Premium Full-width Header synced with Teacher Suite ── */}
      <TeacherHeader
        title="Tạo khóa học mới"
        description="Chọn phương thức khởi tạo và thiết lập các thông tin cấu hình cơ bản cho khóa học của bạn."
        breadcrumbs={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Khóa học</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700 font-light">/</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-extrabold uppercase tracking-widest">Tạo mới</span>
          </div>
        }
        actions={
          <div className="bg-white/80 dark:bg-[#0F1E35]/80 p-1.5 rounded-2xl border border-slate-200/85 dark:border-blue-500/15 backdrop-blur-xs shadow-xs">
            <div role="tablist" className="flex items-center gap-1.5">
              <button
                type="button"
                role="tab"
                aria-selected={!aiWorkflow}
                onClick={() => { setAiWorkflow(false); setSubmitNotice(null); }}
                className={`inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold rounded-xl transition-all duration-200 ${
                  !aiWorkflow
                    ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Thủ công</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={aiWorkflow}
                onClick={() => { setAiWorkflow(true); setSubmitNotice(null); }}
                className={`inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold rounded-xl transition-all duration-200 ${
                  aiWorkflow
                    ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-xs font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Tạo bằng AI (Sơ đồ)</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6">
        {/* Notice Banner */}
        {submitNotice && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <Alert type={submitNotice.type}>{submitNotice.message}</Alert>
          </div>
        )}

        {/* Content Areas */}
        {aiWorkflow ? (
          orgLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500 font-medium animate-pulse">
              Đang chuẩn bị không gian tạo khóa học bằng AI…
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-400">
              <CourseBlueprintWorkspace
                userId={Number(userId)}
                organizations={orgs}
                onCancel={() => router.push("/lms/teacher/courses")}
                onComplete={async (courseId) => {
                  router.push(`/lms/teacher/courses/${courseId}`);
                }}
              />
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* ── Left Column: Form Controls (Borderless Frameless Flow Layout) ── */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-10">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-blue-500/15">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-blue-950/40 text-slate-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs border border-slate-200/60 dark:border-blue-500/15 select-none">
                      01
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Thông tin cơ bản
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-snug">Tên khóa học và mô tả tổng quan chương trình giảng dạy</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <Input
                      label="Tên khóa học"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Lập trình Python cơ bản cho người mới bắt đầu"
                      error={errors.title}
                    />

                    <Textarea
                      label="Mô tả khóa học"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Nhập mô tả chi tiết về khóa học, mục tiêu học tập, đối tượng học viên..."
                      rows={5}
                      error={errors.description}
                    />
                  </div>
                </div>

                {/* Section 2: Details & Config */}
                <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-blue-500/15">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs border border-slate-200/60 dark:border-purple-500/15 select-none">
                      02
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Chi tiết & Phân quyền
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-snug">Danh mục, độ khó, quyền sở hữu tổ chức và hiển thị</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Danh mục"
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="VD: Lập trình, Thiết kế..."
                      />

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Mức độ khó
                        </label>
                        <FilterDropdown
                          value={formData.level}
                          onValueChange={(val) => setFormData({ ...formData, level: val })}
                          icon={<Award className="w-4 h-4 text-slate-400" />}
                          placeholder="Chọn mức độ khó"
                          options={COURSE_LEVELS}
                        />
                      </div>
                    </div>

                    {/* Organization Select */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Tổ chức sở hữu <span className="text-red-500">*</span>
                      </label>
                      {orgLoading ? (
                        <div className="text-sm text-slate-500 animate-pulse py-2.5">Đang tải danh sách tổ chức...</div>
                      ) : (
                        <FilterDropdown
                          value={formData.org_id ? String(formData.org_id) : ""}
                          onValueChange={(val) => setFormData({ ...formData, org_id: Number(val) })}
                          icon={<Building2 className="w-4 h-4 text-slate-400" />}
                          placeholder="Chọn tổ chức sở hữu"
                          options={orgOptions}
                        />
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                        Chọn tổ chức chịu trách nhiệm quản lý và sở hữu khóa học này.
                      </p>
                    </div>

                    {/* Visibility Selector Tiles */}
                    <RadioTileGroup
                      label="Khả năng hiển thị"
                      value={formData.visibility}
                      onChange={(val) => setFormData({ ...formData, visibility: val })}
                      options={[
                        {
                          value: "PUBLIC",
                          title: "Public - Tự do",
                          description: "Tất cả học viên đều tìm thấy",
                          icon: <Globe className="w-4 h-4" />,
                        },
                        {
                          value: "ORG_ONLY",
                          title: "Nội bộ - Org Only",
                          description: "Chỉ thành viên tổ chức",
                          icon: <Lock className="w-4 h-4" />,
                        },
                      ]}
                    />

                    {/* Thumbnail Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Ảnh đại diện khóa học
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
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">Đã tải lên ảnh đại diện thành công</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, thumbnail_url: "" })}
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold ml-auto active:scale-95 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/80 dark:border-blue-500/15">
                  <SecondaryBtn
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-xs font-semibold"
                  >
                    Hủy
                  </SecondaryBtn>
                  <PrimaryBtn
                    type="submit"
                    loading={loading}
                    icon={<PlusCircle className="w-4 h-4" />}
                    className="py-2.5 px-6 text-xs font-bold"
                  >
                    {loading ? "Đang tạo khóa học..." : "Tạo khóa học ngay"}
                  </PrimaryBtn>
                </div>

              </div>

              {/* ── Right Column: Sticky Live Preview & Helpful Guidance Card (lg:col-span-5 xl:col-span-4) ── */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
                
                {/* Live Card Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span>Xem trước thẻ khóa học</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold py-0.5 px-2.5 rounded-full bg-blue-50 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/30 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 animate-pulse" />
                      Live Preview
                    </span>
                  </div>

                  <div className="h-[380px] w-full">
                    <CourseCard
                      id={0}
                      title={formData.title.trim() || "Tên khóa học của bạn"}
                      category={formData.category.trim() || "Danh mục"}
                      level={formData.level}
                      status="DRAFT"
                      thumbnailUrl={formData.thumbnail_url || undefined}
                      teacherName="Bạn (Giảng viên)"
                      createdAt={new Date().toISOString()}
                      enrollmentCount={0}
                    />
                  </div>
                </div>

                {/* Tip Box */}
                <div className="p-5 bg-gradient-to-br from-blue-50/50 via-white/80 to-indigo-50/40 dark:from-[#0F1E35]/90 dark:via-[#0F1E35]/70 dark:to-blue-950/20 backdrop-blur-md border border-blue-100/80 dark:border-blue-500/15 rounded-3xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                    <span>Lưu ý khi khởi tạo</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Khóa học mới sau khi khởi tạo sẽ ở trạng thái <strong>Bản nháp (Draft)</strong>.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                    Bạn có thể bổ sung syllabus, chương mục, tài liệu và ngân hàng câu hỏi trắc nghiệm trước khi bấm <strong>Xuất bản</strong> để mở đăng ký cho học viên.
                  </p>
                </div>

              </div>

            </div>
          </form>
        )}
      </div>
    </div>
  );
}
