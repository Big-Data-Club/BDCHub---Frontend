"use client";

import { Course, Section } from "@/types";
import { InteractiveGlowCard, EmptyState } from "@/components/lms/shared";
import { 
  BookOpen, PlusCircle, ArrowRight, ChevronRight,
  Sparkles, Users, Layers
} from "lucide-react";
import Link from "next/link";
import { CoTeacherSection } from "./CoTeacherSection";

export function OverviewTab({ course, sections }: { course: Course; sections: Section[] }) {
  const publishedSectionsCount = sections.filter(s => s.is_published).length;
  const draftSectionsCount = sections.length - publishedSectionsCount;

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn duration-550">
      
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
                  Khung chương trình giảng dạy
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tổng quan các chương học và truy cập trình quản lý bài giảng.
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
                    <span className="text-slate-400 font-medium">Bản nháp:</span>
                    <p className={`font-extrabold text-sm mt-0.5 ${draftSectionsCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`}>
                      {draftSectionsCount} chương
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
                        Khởi tạo Quiz bằng AI
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        Tự động tạo câu hỏi từ tài liệu
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
                        Tiến độ học viên
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        Theo dõi quá trình và kết quả học
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
                        Biên soạn bài giảng
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        Quản lý chương và nội dung học
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