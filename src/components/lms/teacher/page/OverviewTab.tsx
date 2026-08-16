"use client";

import { useState } from "react";
import { Course, Section } from "@/types";
import { Badge, InteractiveGlowCard, EmptyState, ProgressBar } from "@/components/lms/shared";
import { 
  BookOpen, Activity, Calendar, Eye, PlusCircle, 
  Users, Shield, CheckCircle, Sparkles, Layers, ArrowRight, ChevronRight,
  ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { CoTeacherSection } from "./CoTeacherSection";

export function OverviewTab({ course, sections }: { course: Course; sections: Section[] }) {
  const isPublished = course.status === "PUBLISHED";
  const hasDescription = !!course.description;
  const hasCategory = !!course.category;
  const hasLevel = !!course.level;
  const hasSections = sections.length > 0;

  const publishedSectionsCount = sections.filter(s => s.is_published).length;

  // Checklist state: default open if draft, collapsed if published
  const [showChecklist, setShowChecklist] = useState(!isPublished);

  // Calculate readiness score
  const checklistItems = [
    { label: "Cập nhật mô tả chi tiết khóa học", checked: hasDescription },
    { label: "Phân loại danh mục và cấp độ học", checked: hasCategory && hasLevel },
    { label: "Biên soạn tối thiểu 01 chương học", checked: hasSections },
    { label: "Xuất bản khóa học công khai", checked: isPublished },
  ];

  const checkedCount = checklistItems.filter(item => item.checked).length;
  const readinessPercent = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn duration-550">
      
      {/* ── Top Collapsible Readiness Banner ── */}
      <div className="bg-white/90 dark:bg-[#0F1E35]/90 backdrop-blur-md border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-4 md:p-5 shadow-xs transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${readinessPercent === 100 ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/25 shadow-2xs" : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/25 shadow-2xs"}`}>
              {readinessPercent === 100 ? <CheckCircle className="w-5 h-5 stroke-[2.2]" /> : <AlertCircle className="w-5 h-5 stroke-[2.2]" />}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Độ sẵn sàng vận hành
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${readinessPercent === 100 ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30" : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"}`}>
                    {readinessPercent}%
                  </span>
                  <Badge variant={readinessPercent === 100 ? "green" : "yellow"}>
                    {readinessPercent === 100 ? "Đã hoàn thiện" : "Cần bổ sung"}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed truncate sm:whitespace-normal">
                {readinessPercent === 100 
                  ? "Khóa học đã đáp ứng đầy đủ các tiêu chuẩn vận hành và sẵn sàng phục vụ học viên."
                  : `Đã hoàn thành ${checkedCount}/${checklistItems.length} hạng mục tiêu chuẩn để xuất bản khóa học.`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3.5 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-blue-500/10">
            {/* Visual Progress Bar from shared design system */}
            <div className="w-36 sm:w-44">
              <ProgressBar 
                value={readinessPercent} 
                max={100} 
                color={readinessPercent === 100 ? "green" : "blue"}
                showPercent={false}
                className="w-full"
              />
            </div>

            <button
              type="button"
              aria-expanded={showChecklist}
              aria-controls="course-readiness-checklist"
              onClick={() => setShowChecklist(prev => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-[#0D192E] hover:bg-slate-200/80 dark:hover:bg-[#162644] rounded-xl transition-all border border-slate-200 dark:border-blue-500/20 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>{showChecklist ? "Thu gọn" : "Xem tiêu chuẩn"}</span>
              {showChecklist ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Checklist Grid */}
        {showChecklist && (
          <div 
            id="course-readiness-checklist"
            className="mt-4 pt-4 border-t border-slate-100 dark:border-blue-500/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 ease-in-out animate-fadeIn"
          >
            {checklistItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all duration-200 ${item.checked ? "bg-slate-50/70 dark:bg-[#0D192E]/50 border-slate-200/80 dark:border-blue-500/15" : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/40 shadow-2xs"}`}
              >
                {item.checked ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 dark:border-amber-500 flex-shrink-0 animate-pulse" />
                )}
                <span className={`text-xs font-semibold tracking-tight ${item.checked ? "text-slate-500 dark:text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600" : "text-slate-800 dark:text-slate-100 font-bold"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Layout Workspace Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column (Span 2): Curriculum Quick Hub & Co-teachers */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Section 1: Curriculum Quick Hub (Khung chương trình & Bài học) */}
          <InteractiveGlowCard 
            interactive={false} 
            showOffset={false} 
            innerClassName="p-5 md:p-6 bg-white dark:bg-[#0F1E35] space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/10 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-wide">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Khung chương trình & Bài học
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Xem nhanh danh sách chương học và truy cập trình quản lý nội dung chi tiết.
                </p>
              </div>

              <Link
                href={`/lms/teacher/courses/${course.id}/content`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 rounded-xl active:scale-95 transition-all shadow-xs flex-shrink-0"
              >
                <span>Quản lý bài học</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Metrics & Chapter Shortcuts */}
            {sections.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-blue-500/15 text-center space-y-3">
                <EmptyState
                  icon={<BookOpen className="w-8 h-8 stroke-1 text-slate-400" />}
                  title="Chưa có chương học nào"
                  description="Khóa học này chưa được cấu trúc nội dung. Hãy tạo chương đầu tiên để bắt đầu đăng bài giảng."
                  action={
                    <Link
                      href={`/lms/teacher/courses/${course.id}/content`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Tạo chương bài học đầu tiên
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stats summary bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-[#0D192E] rounded-xl border border-slate-200/80 dark:border-blue-500/15 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Tổng số chương:</span>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {sections.length} chương
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Đã xuất bản:</span>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                      {publishedSectionsCount} / {sections.length} chương
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 font-medium">Trạng thái biên soạn:</span>
                    <p className="font-extrabold text-blue-600 dark:text-cyan-400 text-sm mt-0.5">
                      Sẵn sàng giảng dạy
                    </p>
                  </div>
                </div>

                {/* Section Quick Jump Pills */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Danh sách chương học
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sections.slice(0, 6).map((section, idx) => (
                      <Link 
                        key={section.id}
                        href={`/lms/teacher/courses/${course.id}/content?section=${section.id}`}
                        className="group flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#0D192E]/60 border border-slate-200/80 dark:border-blue-500/15 hover:border-blue-500/40 dark:hover:border-cyan-500/40 hover:shadow-2xs transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-cyan-950/40 text-blue-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {section.title}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                      </Link>
                    ))}
                  </div>

                  {sections.length > 6 && (
                    <div className="text-center pt-1">
                      <Link
                        href={`/lms/teacher/courses/${course.id}/content`}
                        className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        Xem toàn bộ {sections.length} chương trong tab Nội dung bài học →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </InteractiveGlowCard>

          {/* Section 2: Co-teachers Management */}
          <CoTeacherSection course={course} />

        </div>

        {/* Right Column (Span 1): Teacher Quick Tools & Management Shortcuts */}
        <div className="space-y-6">
          
          {/* Teacher Quick Tools Card Hub */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-cyan-400">
                Công cụ hỗ trợ Giảng dạy
              </h4>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                3 lối tắt
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Tool 1: AI Quiz Generator */}
              <Link href={`/lms/teacher/courses/${course.id}/analytics`}>
                <InteractiveGlowCard
                  accentColor="purple"
                  interactive={true}
                  showOffset={false}
                  showGlow={false}
                  innerClassName="p-3.5 bg-white dark:bg-[#0F1E35] flex items-center gap-3 justify-between hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all duration-200 shadow-2xs group rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-200/60 dark:border-purple-500/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Tạo Quiz bằng AI
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        Tự động khởi tạo câu hỏi từ tài liệu
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </InteractiveGlowCard>
              </Link>

              {/* Tool 2: Learner Management */}
              <Link href={`/lms/teacher/courses/${course.id}/students`}>
                <InteractiveGlowCard
                  accentColor="blue"
                  interactive={true}
                  showOffset={false}
                  showGlow={false}
                  innerClassName="p-3.5 bg-white dark:bg-[#0F1E35] flex items-center gap-3 justify-between hover:border-blue-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 shadow-2xs group rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-cyan-950/50 text-blue-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-blue-200/60 dark:border-blue-500/20 group-hover:bg-blue-100 dark:group-hover:bg-cyan-950/80 transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                        Theo dõi Học viên
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        Quản lý danh sách & tiến độ học tập
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </InteractiveGlowCard>
              </Link>

              {/* Tool 3: Content Builder */}
              <Link href={`/lms/teacher/courses/${course.id}/content`}>
                <InteractiveGlowCard
                  accentColor="cyan"
                  interactive={true}
                  showOffset={false}
                  showGlow={false}
                  innerClassName="p-3.5 bg-white dark:bg-[#0F1E35] flex items-center gap-3 justify-between hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 shadow-2xs group rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-200/60 dark:border-cyan-500/20 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 transition-colors">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        Soạn bài & Tài liệu
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        Thêm bài giảng video, tài liệu đính kèm
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </InteractiveGlowCard>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}