"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, Users, GraduationCap, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Play, Award, Globe, Lock,
} from "lucide-react";

import { lmsService } from "@/services/lms/lmsService";
import { useCourseDiscoverDetail } from "@/hooks/lms/student/useCourseDiscoverDetail";
import { Course, Section } from "@/types";
import { Badge, PrimaryBtn, GridBackground, LmsPageHeader } from "@/components/lms/shared";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/shared/BreadcrumbNav";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
  ALL_LEVELS: "Mọi cấp độ",
};
const LEVEL_BADGE: Record<string, "green" | "yellow" | "red" | "blue"> = {
  BEGINNER: "green",
  INTERMEDIATE: "yellow",
  ADVANCED: "red",
  ALL_LEVELS: "blue",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0D192E]/80 border border-slate-200 dark:border-blue-500/10 text-center min-w-[80px]">
      <span className="text-blue-500 dark:text-cyan-400">{icon}</span>
      <span className="text-lg font-extrabold text-slate-900 dark:text-white">{value}</span>
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function InstructorChip({ name, email, isPrimary }: { name?: string; email?: string; isPrimary?: boolean }) {
  const safeName = String(name || "Giáo viên");
  const initials = safeName
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0D192E]/60 border border-slate-200 dark:border-blue-500/10">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-sm">
        {initials || <GraduationCap className="w-5 h-5" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{name}</p>
        {email && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>}
        {isPrimary && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            Người tạo khóa học
          </span>
        )}
      </div>
    </div>
  );
}

function SectionAccordion({ section, index }: { section: Section; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [contents, setContents] = useState<any[] | null>(null);
  const [loadingContents, setLoadingContents] = useState(false);

  useEffect(() => {
    if (open && contents === null && !loadingContents) {
      setLoadingContents(true);
      lmsService
        .listContent(section.id)
        .then((res) => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setContents(list);
        })
        .catch(() => setContents([]))
        .finally(() => setLoadingContents(false));
    }
  }, [open, contents, loadingContents, section.id]);

  return (
    <div className="border border-slate-200 dark:border-blue-500/10 rounded-xl overflow-hidden transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left bg-white dark:bg-[#0F1E35]/80 hover:bg-slate-50 dark:hover:bg-[#162644]/60 transition-colors duration-150 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{section.title}</span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-3.5 pt-2 bg-slate-50/60 dark:bg-[#0A1628]/50 border-t border-slate-100 dark:border-blue-500/10 space-y-2">
          {section.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pb-1">{section.description}</p>
          )}

          {loadingContents ? (
            <div className="py-2 text-xs text-slate-400 dark:text-slate-500 animate-pulse flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              Đang tải danh sách bài học...
            </div>
          ) : contents && contents.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {contents.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-[#0F1E35]/60 border border-slate-200/60 dark:border-blue-500/10 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-blue-500 dark:text-cyan-400 font-bold flex-shrink-0">
                      {item.type === "VIDEO" ? "🎥" : item.type === "QUIZ" ? "❓" : item.type === "DOCUMENT" ? "📄" : "📝"}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.title}</span>
                  </div>
                  {item.is_mandatory && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/30 flex-shrink-0">
                      Bắt buộc
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">Chưa có nội dung bài học.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CourseOverviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const id = Number(courseId);

  const { course, sections, coTeachers, isEnrolled, loading, enrolling, error, handleEnroll, handleGoLearn } =
    useCourseDiscoverDetail(id);

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-screen bg-slate-50 dark:bg-[#050B18] animate-pulse">
        <div className="h-32 bg-white/20 dark:bg-[#070E1C]/20 border-b border-slate-200/80 dark:border-blue-500/15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
            </div>
            <div className="h-80 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex items-center justify-center flex-col gap-4 text-slate-500 dark:text-slate-400">
        <BookOpen className="w-12 h-12 opacity-40" />
        <p className="font-semibold">Không tìm thấy khóa học.</p>
        <Link href="/lms/student/discover" className="text-sm text-blue-600 dark:text-cyan-400 hover:underline font-bold">
          Quay lại khám phá
        </Link>
      </div>
    );
  }

  const categories = (course.category as string | null | undefined)
    ?.split(",")
    .map((c) => c.trim())
    .filter(Boolean) ?? [];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    { label: "Khám phá", href: "/lms/student/discover" },
    { label: course.title },
  ];

  const allInstructors = [
    ...(course.creator_name ? [{ id: -1, name: course.creator_name, email: course.creator_email ?? "", isPrimary: true }] : []),
    ...coTeachers.map((t: any) => ({
      id: t.id ?? t.user_id ?? Math.random(),
      name: t.name ?? t.full_name ?? t.user_name ?? t.email ?? "Giáo viên",
      email: t.email ?? "",
      isPrimary: false,
    })),
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 dark:bg-[#050B18]">
      {/* Header */}
      <LmsPageHeader
        breadcrumbs={<BreadcrumbNav items={breadcrumbItems} />}
        title={course.title}
        bottomBar={
          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((cat, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20"
              >
                {cat}
              </span>
            ))}
          </div>
        }
      />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-blue-500/10 pb-3">
                Giới thiệu khóa học
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {course.description || "Chưa có mô tả chi tiết."}
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                <StatPill icon={<BookOpen className="w-5 h-5" />} label="Chương học" value={sections.length} />
                <StatPill icon={<Users className="w-5 h-5" />} label="Học viên" value={course.enrollment_count ?? 0} />
              </div>
            </div>

            {/* Syllabus */}
            <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-blue-500/10 pb-3">
                Nội dung chương trình ({sections.length} chương)
              </h2>
              {sections.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Chưa có chương học nào.</p>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, idx) => (
                    <SectionAccordion key={section.id} section={section} index={idx} />
                  ))}
                </div>
              )}
            </div>

            {/* Instructors */}
            {allInstructors.length > 0 && (
              <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-blue-500/10 pb-3">
                  Đội ngũ giảng dạy
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allInstructors.map((ins) => (
                    <InstructorChip key={ins.id} name={ins.name} email={ins.email} isPrimary={ins.isPrimary} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA Hero Card */}
          <div>
            <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl overflow-hidden shadow-lg sticky top-20">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-950/20 dark:to-[#0D192E] overflow-hidden relative">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-blue-300 dark:text-blue-900/30" />
                  </div>
                )}
                {course.level && (
                  <div className="absolute bottom-3 left-3">
                    <Badge variant={LEVEL_BADGE[course.level] ?? "gray"}>
                      {LEVEL_LABEL[course.level] ?? course.level}
                    </Badge>
                  </div>
                )}
                {course.visibility === "ORG_ONLY" && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-white">
                      <Lock className="w-3 h-3" /> Nội bộ
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                {isEnrolled ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Bạn đã đăng ký khóa học này
                    </div>
                    <PrimaryBtn size="lg" className="w-full" onClick={handleGoLearn} icon={<Play className="w-4 h-4" />}>
                      Vào học ngay
                    </PrimaryBtn>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Đăng ký để bắt đầu học ngay hôm nay.
                    </div>
                    <PrimaryBtn
                      size="lg"
                      loading={enrolling}
                      className="w-full"
                      onClick={handleEnroll}
                      icon={!enrolling ? <Award className="w-4 h-4" /> : undefined}
                    >
                      Đăng ký ngay
                    </PrimaryBtn>
                  </>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-blue-500/10 space-y-2">
                  {course.creator_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium">Tạo bởi {course.creator_name}</span>
                    </div>
                  )}
                  {course.published_at && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Xuất bản: {formatDate(course.published_at)}</span>
                    </div>
                  )}
                  {course.enrollment_count !== undefined && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{course.enrollment_count.toLocaleString()} học viên</span>
                    </div>
                  )}
                  {course.visibility && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{course.visibility === "PUBLIC" ? "Công khai" : "Chỉ nội bộ tổ chức"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
