"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import lmsService from "@/services/lms/lmsService";
import { organizationService } from "@/services/admin/organizationService";
import FileUpload from "@/components/lms/teacher/upload/FileUpload";
import { FileInfo, Organization } from "@/types";
import { CourseBlueprintWorkspace } from "@/components/lms/teacher/CourseBlueprintWorkspace";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { Input, Textarea, PrimaryBtn, SecondaryBtn, Alert, CourseCard, RadioTileGroup, Select, TabBar, LmsPageHeader, BreadcrumbNav } from "@/components/lms/shared";
import { 
  Wand2, FileEdit, PlusCircle, Trash2, Globe, Lock, Sparkles, CheckCircle2, Award, Building2, Save, AlertTriangle
} from "lucide-react";

const DRAFT_STORAGE_KEY = "lms_create_course_draft_v1";

const COURSE_LEVELS = [
  { value: "BEGINNER", label: "Cơ bản" },
  { value: "INTERMEDIATE", label: "Trung cấp" },
  { value: "ADVANCED", label: "Nâng cao" },
  { value: "ALL_LEVELS", label: "Mọi cấp độ" }
];

const WORKFLOW_TABS = [
  { id: "manual", label: "Thủ công", icon: <FileEdit className="w-3.5 h-3.5" /> },
  { id: "ai", label: "Tạo bằng AI (Sơ đồ)", icon: <Wand2 className="w-3.5 h-3.5" /> },
];

export default function CreateCoursePage() {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitNotice, setSubmitNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [aiWorkflow, setAiWorkflow] = useState(false); // Manual creation by default
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
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

  // Check if form is modified/dirty
  const isDirty = useMemo(() => {
    return (
      formData.title.trim() !== "" ||
      formData.description.trim() !== "" ||
      formData.category.trim() !== "" ||
      formData.thumbnail_url !== ""
    );
  }, [formData]);

  // Load saved draft on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setFormData(prev => ({ ...prev, ...parsed }));
          setHasDraftRestored(true);
        }
      }
    } catch (e) {
      console.error("Failed to restore course draft:", e);
    }
  }, []);

  // Autosave draft to localStorage when formData changes
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        console.error("Failed to autosave course draft:", e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData, isDirty]);

  // Warn user before closing/reloading window when form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        setOrgLoading(true);
        const list = await organizationService.getMyOrgs();
        setOrgs(list);
        if (list.length > 0) {
          const defaultOrg = list.find(o => o.slug === "bdc") || list[0];
          setFormData(prev => ({ ...prev, org_id: prev.org_id || defaultOrg.id }));
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

  const validateForm = useCallback(() => {
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

    // Auto-focus the first errored element for optimal accessibility & UX
    if (newErrors.title && titleInputRef.current) {
      titleInputRef.current.focus();
    } else if (newErrors.description && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  }, [formData.title, formData.description]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitNotice(null);
    
    if (!validateForm()) {
      setSubmitNotice({
        type: "error",
        message: "Vui lòng kiểm tra và sửa các thông tin bị lỗi bên dưới."
      });
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
      
      // Clear draft on successful submission
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (err) {
        console.error(err);
      }

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
  }, [formData, validateForm, router]);

  // Keyboard shortcut Ctrl+S / Cmd+S to submit form quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  const handleClearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setFormData({
      title: "",
      description: "",
      category: "",
      level: "BEGINNER",
      thumbnail_url: "",
      visibility: "PUBLIC",
      org_id: orgs.length > 0 ? (orgs.find(o => o.slug === "bdc") || orgs[0]).id : undefined,
    });
    setErrors({});
    setHasDraftRestored(false);
  }, [orgs]);

  const handleCancelClick = useCallback(() => {
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      router.back();
    }
  }, [isDirty, router]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-[#050B18]">
      {/* ── Premium Full-width Header with LmsPageHeader ── */}
      <LmsPageHeader
        categoryLabel="Hệ thống quản lý học tập (LMS)"
        title="Tạo khóa học mới"
        description="Điền các thông tin cơ bản để bắt đầu thiết kế khóa học của bạn. Bạn có thể bổ sung bài học và tài liệu sau."
        breadcrumbs={
          <BreadcrumbNav
            items={[
              { label: "Khóa học", href: "/lms/teacher/courses" },
              { label: "Tạo khóa học mới" },
            ]}
          />
        }
        actions={
          <TabBar
            tabs={WORKFLOW_TABS}
            active={aiWorkflow ? "ai" : "manual"}
            onChange={(id) => {
              setAiWorkflow(id === "ai");
              setSubmitNotice(null);
            }}
            variant="pill"
            size="sm"
          />
        }
      />

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6">
        {/* Draft Restoration Notice Banner */}
        {hasDraftRestored && !aiWorkflow && (
          <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-800 dark:text-blue-200 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-blue-600 dark:text-cyan-400 flex-shrink-0" />
              <span>Đã tự động khôi phục nội dung bản nháp đã lưu gần nhất của bạn.</span>
            </div>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-blue-600 dark:text-cyan-400 font-bold hover:underline underline-offset-2 flex-shrink-0"
            >
              Xóa nháp & Nhập mới
            </button>
          </div>
        )}

        {/* Notice Banner */}
        {submitNotice && (
          <div role="alert" aria-live="polite" className="animate-in fade-in slide-in-from-top-2 duration-300">
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
                  try {
                    localStorage.removeItem(DRAFT_STORAGE_KEY);
                  } catch (e) {}
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
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs border border-slate-200/60 dark:border-blue-500/30 select-none">
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
                      ref={titleInputRef}
                      label="Tên khóa học"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="VD: Lập trình Python cơ bản cho người mới bắt đầu"
                      error={errors.title}
                    />

                    <Textarea
                      ref={descriptionInputRef}
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
                    <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs border border-slate-200/60 dark:border-purple-500/30 select-none">
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

                      <Select
                        label="Mức độ khó"
                        value={formData.level}
                        onValueChange={(val) => setFormData({ ...formData, level: val })}
                        icon={<Award className="w-4 h-4 text-slate-400" />}
                        placeholder="Chọn mức độ khó"
                        options={COURSE_LEVELS}
                      />
                    </div>

                    {/* Organization Select */}
                    <div>
                      {orgLoading ? (
                        <div className="text-sm text-slate-500 animate-pulse py-2.5">Đang tải danh sách tổ chức...</div>
                      ) : (
                        <Select
                          label="Tổ chức sở hữu"
                          value={formData.org_id ? String(formData.org_id) : ""}
                          onValueChange={(val) => setFormData({ ...formData, org_id: Number(val) })}
                          icon={<Building2 className="w-4 h-4 text-slate-400" />}
                          placeholder="Chọn tổ chức quản lý"
                          options={orgOptions}
                        />
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                        Tổ chức được chọn sẽ giữ quyền quản trị và cấp quyền phân công giảng viên cho khóa học này.
                      </p>
                    </div>

                    {/* Visibility Selector Tiles */}
                    <RadioTileGroup
                      label="Quyền truy cập & Hiển thị"
                      value={formData.visibility}
                      onChange={(val) => setFormData({ ...formData, visibility: val })}
                      options={[
                        {
                          value: "PUBLIC",
                          title: "Công khai (Public)",
                          description: "Tất cả học viên trên hệ thống đều có thể tìm thấy và đăng ký học",
                          icon: <Globe className="w-4 h-4" />,
                        },
                        {
                          value: "ORG_ONLY",
                          title: "Nội bộ (Organization Only)",
                          description: "Chỉ các thành viên thuộc cùng tổ chức mới có quyền truy cập",
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
                <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-200/80 dark:border-blue-500/15">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                    Mẹo: Bấm <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">Cmd+S</kbd> để tạo nhanh
                  </span>
                  <div className="flex items-center gap-3 ml-auto">
                    <SecondaryBtn
                      type="button"
                      onClick={handleCancelClick}
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

              </div>

              {/* ── Right Column: Sticky Live Preview & Helpful Guidance Card (lg:col-span-5 xl:col-span-4) ── */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
                
                {/* Live Card Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span>Xem trước thẻ khóa học</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold py-0.5 px-2.5 rounded-full bg-blue-50 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-blue-200/50 dark:border-cyan-500/30 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-cyan-400 animate-pulse" />
                      Live Preview
                    </span>
                  </div>

                  <div className="min-h-[360px] h-auto w-full">
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

      {/* Unsaved Changes Warning Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/30">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Rời khỏi trang tạo khóa học?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dữ liệu bạn đang nhập đã được tự động lưu vào bản nháp cục bộ.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn có thể quay lại bất cứ lúc nào để tiếp tục hoàn thiện nội dung khóa học.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <SecondaryBtn
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold"
              >
                Tiếp tục chỉnh sửa
              </SecondaryBtn>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  router.back();
                }}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 rounded-xl transition-all"
              >
                Rời khỏi trang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

