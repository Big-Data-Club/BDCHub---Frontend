"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, Users, GraduationCap, ChevronDown, ChevronUp,
  ArrowLeft, CheckCircle2, Clock, BarChart3, Play,
  Award, Globe, Lock, Layers,
} from "lucide-react";

import { lmsService } from "@/services/lmsService";
import {
  consumeRecommendationAttribution,
  trackRecommendationEvent,
} from "@/services/recommendationService";
import { Course, Section } from "@/types";
import {
  Badge, PrimaryBtn, GridBackground,
} from "@/components/lms/shared";
import { BreadcrumbNav, type BreadcrumbItem } from "@/components/lms/BreadcrumbNav";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return ""; }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0D192E]/80 border border-slate-200 dark:border-blue-500/10 text-center min-w-[80px]">
      <span className="text-blue-500 dark:text-cyan-400">{icon}</span>
      <span className="text-lg font-extrabold text-slate-900 dark:text-white">{value}</span>
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function InstructorChip({ name, email, isPrimary }: { name: string; email?: string; isPrimary?: boolean }) {
  const initials = name
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
        {email && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
        )}
        {isPrimary && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
            Giáo viên chính
          </span>
        )}
      </div>
    </div>
  );
}

function SectionAccordion({ section, index }: { section: Section; index: number }) {
  const [open, setOpen] = useState(index === 0);

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
          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {section.title}
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-3.5 pt-1 bg-slate-50/60 dark:bg-[#0A1628]/50 border-t border-slate-100 dark:border-blue-500/10 space-y-1.5">
          {section.description ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1 pb-1">
              {section.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic pt-1">
              Không có mô tả.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CTA Hero Sidebar ─────────────────────────────────────────────────────────

interface CTASidebarProps {
  course: Course;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
  onGoLearn: () => void;
}

function CTASidebar({ course, isEnrolled, isEnrolling, onEnroll, onGoLearn }: CTASidebarProps) {
  return (
    <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl overflow-hidden shadow-lg dark:shadow-[0_4px_40px_rgba(6,182,212,0.06)]">
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-950/20 dark:to-[#0D192E] overflow-hidden relative">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-16 h-16 text-blue-300 dark:text-blue-900/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
        {/* Level badge overlay */}
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

      {/* CTA Body */}
      <div className="p-5 space-y-4">
        {isEnrolled ? (
          <>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Bạn đã đăng ký khóa học này
            </div>
            <PrimaryBtn
              size="lg"
              className="w-full shadow-md shadow-blue-500/20 dark:shadow-cyan-500/10"
              onClick={onGoLearn}
              icon={<Play className="w-4 h-4" />}
            >
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
              loading={isEnrolling}
              className="w-full shadow-md shadow-blue-500/20 dark:shadow-cyan-500/10"
              onClick={onEnroll}
              icon={!isEnrolling ? <Award className="w-4 h-4" /> : undefined}
            >
              Đăng ký ngay
            </PrimaryBtn>
          </>
        )}

        {/* Quick info strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-blue-500/10 space-y-2">
          {course.teacher_name && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-medium">{course.teacher_name}</span>
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
              <span>{course.enrollment_count.toLocaleString()} học viên đang học</span>
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
  );
}

// ─── Page Skeleton ─────────────────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 dark:bg-[#050B18] animate-pulse">
      <div className="h-32 bg-white/20 dark:bg-[#070E1C]/20 border-b border-slate-200/80 dark:border-blue-500/15" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseOverviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const id = Number(courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [coTeachers, setCoTeachers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  // ── Load all data in parallel ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [courseRes, sectionsRes, enrollmentsRes] = await Promise.all([
        lmsService.getCourse(id),
        lmsService.listSections(id),
        lmsService.getMyEnrollments("ACCEPTED"),
      ]);

      const courseData: Course = courseRes?.data ?? courseRes;
      setCourse(courseData);

      const sectionsData: Section[] = sectionsRes?.data ?? sectionsRes ?? [];
      // Only show published sections on overview
      setSections(sectionsData.filter((s: Section) => s.is_published));

      const enrolledIds = new Set((enrollmentsRes ?? []).map((e: any) => e.course_id));
      setIsEnrolled(enrolledIds.has(id));

      // Co-teachers: optional, fail gracefully
      try {
        const teachers = await lmsService.getCoTeachers(id);
        setCoTeachers(teachers ?? []);
      } catch {
        setCoTeachers([]);
      }
    } catch {
      setError("Không thể tải thông tin khóa học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleEnroll = async () => {
    setEnrolling(true);
    setError("");
    try {
      await lmsService.enrollCourse(id);
      const attribution = consumeRecommendationAttribution(id);
      if (attribution) {
        trackRecommendationEvent(
          attribution.item,
          attribution.recommendationSetId,
          "accept",
          attribution.surface,
        );
      }
      // After enrollment, navigate to course learning page
      router.push(`/lms/student/courses/${id}/learn`);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      setEnrolling(false);
    }
  };

  const handleGoLearn = () => {
    router.push(`/lms/student/courses/${id}/learn`);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <OverviewSkeleton />;

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050B18] flex items-center justify-center flex-col gap-4 text-slate-500 dark:text-slate-400">
        <BookOpen className="w-12 h-12 opacity-40" />
        <p className="font-semibold">Không tìm thấy khóa học.</p>
        <Link
          href="/lms/student/discover"
          className="text-sm text-blue-600 dark:text-cyan-400 hover:underline font-bold"
        >
          Quay lại khám phá
        </Link>
      </div>
    );
  }

  const categories = course.category
    ? course.category.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Học tập", href: "/lms/student" },
    { label: "Khám phá", href: "/lms/student/discover" },
    { label: course.title },
  ];

  const allInstructors = [
    ...(course.teacher_name
      ? [{ id: -1, name: course.teacher_name, email: course.teacher_email ?? "", isPrimary: true }]
      : []),
    ...coTeachers.map((t) => ({ ...t, isPrimary: false })),
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50 dark:bg-[#050B18]">
      {/* ── Header ── */}
      <div className="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-blue-500/15 bg-white/20 dark:bg-[#070E1C]/20 backdrop-blur-xs py-6 md:py-8">
        <GridBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <BreadcrumbNav items={breadcrumbItems} />
          <div className="mt-4 flex items-start gap-4 flex-wrap justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/20"
                  >
                    {cat}
                  </span>
                ))}
                {course.level && (
                  <Badge variant={LEVEL_BADGE[course.level] ?? "gray"}>
                    {LEVEL_LABEL[course.level] ?? course.level}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium max-w-2xl">
                  {course.description}
                </p>
              )}
            </div>

            {/* Mobile-only back btn */}
            <Link
              href="/lms/student/discover"
              className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm text-rose-700 dark:text-rose-400 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left / Main Content ── */}
          <div className="lg:col-span-2 space-y-7">

            {/* Stats row */}
            <div className="flex flex-wrap gap-3">
              <StatPill
                icon={<Users className="w-5 h-5" />}
                label="Học viên"
                value={(course.enrollment_count ?? 0).toLocaleString()}
              />
              <StatPill
                icon={<Layers className="w-5 h-5" />}
                label="Chương"
                value={sections.length}
              />
              <StatPill
                icon={<BarChart3 className="w-5 h-5" />}
                label="Cấp độ"
                value={LEVEL_LABEL[course.level] ?? course.level ?? "—"}
              />
              {course.published_at && (
                <StatPill
                  icon={<Clock className="w-5 h-5" />}
                  label="Xuất bản"
                  value={formatDate(course.published_at)}
                />
              )}
            </div>

            {/* Mobile CTA card */}
            <div className="lg:hidden">
              <CTASidebar
                course={course}
                isEnrolled={isEnrolled}
                isEnrolling={enrolling}
                onEnroll={handleEnroll}
                onGoLearn={handleGoLearn}
              />
            </div>

            {/* Instructors */}
            {allInstructors.length > 0 && (
              <section className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-blue-500 dark:text-cyan-400" />
                  Giảng viên
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allInstructors.map((inst) => (
                    <InstructorChip
                      key={inst.id}
                      name={inst.name}
                      email={inst.email}
                      isPrimary={inst.isPrimary}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Course Description (full) */}
            {course.description && (
              <section className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-blue-500 dark:text-cyan-400" />
                  Mô tả khóa học
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {course.description}
                </p>
              </section>
            )}

            {/* Sections (Chapters Accordion) */}
            <section className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/15 rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-blue-500 dark:text-cyan-400" />
                Nội dung khóa học
                <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400 normal-case">
                  {sections.length} chương
                </span>
              </h2>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Chưa có nội dung được xuất bản.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sections
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((section, index) => (
                      <SectionAccordion
                        key={section.id}
                        section={section}
                        index={index}
                      />
                    ))}
                </div>
              )}
            </section>

            {/* Bottom CTA for mobile spacing */}
            <div className="lg:hidden pb-4">
              {isEnrolled ? (
                <PrimaryBtn
                  size="lg"
                  className="w-full shadow-md"
                  onClick={handleGoLearn}
                  icon={<Play className="w-4 h-4" />}
                >
                  Vào học ngay
                </PrimaryBtn>
              ) : (
                <PrimaryBtn
                  size="lg"
                  loading={enrolling}
                  className="w-full shadow-md"
                  onClick={handleEnroll}
                  icon={!enrolling ? <Award className="w-4 h-4" /> : undefined}
                >
                  Đăng ký ngay
                </PrimaryBtn>
              )}
            </div>
          </div>

          {/* ── Right Sticky Sidebar ── */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <CTASidebar
                course={course}
                isEnrolled={isEnrolled}
                isEnrolling={enrolling}
                onEnroll={handleEnroll}
                onGoLearn={handleGoLearn}
              />

              {/* Back to Discover link */}
              <Link
                href="/lms/student/discover"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-150 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Quay lại khám phá
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
