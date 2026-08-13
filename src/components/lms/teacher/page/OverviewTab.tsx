"use client";

import { Course, Section } from "@/types";
import { Badge, InteractiveGlowCard, EmptyState } from "@/components/lms/shared";
import { 
  BookOpen, Trophy, Tag, Activity, Calendar, Eye, EyeOff, PlusCircle, 
  Users, Shield, CheckCircle, Info, User
} from "lucide-react";
import Link from "next/link";

export function OverviewTab({ course, sections }: { course: Course; sections: Section[] }) {
  const isPublished = course.status === "PUBLISHED";
  const hasDescription = !!course.description;
  const hasCategory = !!course.category;
  const hasLevel = !!course.level;
  const hasSections = sections.length > 0;

  // Calculate readiness score
  const checklistItems = [
    { label: "Cập nhật mô tả khóa học", checked: hasDescription },
    { label: "Thiết lập danh mục & cấp độ", checked: hasCategory && hasLevel },
    { label: "Tạo ít nhất 1 chương học", checked: hasSections },
    { label: "Xuất bản khóa học", checked: isPublished },
  ];

  const checkedCount = checklistItems.filter(item => item.checked).length;
  const readinessPercent = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn duration-550">
      
      {/* ── Metrics Dashboard Grid ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-cyan-400/80">
          Thống kê tổng quan
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Status */}
          <InteractiveGlowCard 
            accentColor={isPublished ? "green" : "orange"}
            interactive={true}
            showOffset={true}
            className="h-full"
            innerClassName="p-5 md:p-6 flex flex-col justify-between h-full bg-white dark:bg-[#0F1E35]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Trạng thái</span>
              <Activity className={`w-5 h-5 ${isPublished ? "text-emerald-500" : "text-amber-500"}`} />
            </div>
            <div className="mt-4">
              <Badge variant={isPublished ? "green" : "yellow"}>
                {isPublished ? "Đã xuất bản" : "Bản nháp"}
              </Badge>
            </div>
          </InteractiveGlowCard>

          {/* Card 2: Visibility */}
          <InteractiveGlowCard 
            accentColor="blue"
            interactive={true}
            showOffset={true}
            className="h-full"
            innerClassName="p-5 md:p-6 flex flex-col justify-between h-full bg-white dark:bg-[#0F1E35]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chế độ hiển thị</span>
              <Shield className="w-5 h-5 text-blue-500 dark:text-cyan-400" />
            </div>
            <div className="mt-4">
              <Badge variant={course.visibility === "PUBLIC" ? "blue" : "gray"}>
                {course.visibility === "PUBLIC" ? "Công khai" : "Nội bộ"}
              </Badge>
            </div>
          </InteractiveGlowCard>

          {/* Card 3: Enrollment Count */}
          <InteractiveGlowCard 
            accentColor="purple"
            interactive={true}
            showOffset={true}
            className="h-full"
            innerClassName="p-5 md:p-6 flex flex-col justify-between h-full bg-white dark:bg-[#0F1E35]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Học viên tham gia</span>
              <Users className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="mt-4">
              <span className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-wide">
                {course.enrollment_count ?? 0} học viên
              </span>
            </div>
          </InteractiveGlowCard>

          {/* Card 4: Chapter count */}
          <InteractiveGlowCard 
            accentColor="cyan"
            interactive={true}
            showOffset={true}
            className="h-full"
            innerClassName="p-5 md:p-6 flex flex-col justify-between h-full bg-white dark:bg-[#0F1E35]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chương học</span>
              <BookOpen className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div className="mt-4">
              <span className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-wide">
                {sections.length} chương
              </span>
            </div>
          </InteractiveGlowCard>
        </div>
      </div>

      {/* ── Main Layout Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column (Span 2): About & Roadmap */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Section: About Course */}
          <InteractiveGlowCard 
            interactive={false} 
            showOffset={false} 
            innerClassName="p-5 md:p-6 bg-white dark:bg-[#0F1E35]"
          >
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 tracking-wide">
              <Info className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Thông tin chung
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-450 dark:text-slate-500 font-medium tracking-wide">Mô tả</span>
                <p className="text-sm text-slate-600 dark:text-slate-350 mt-1 leading-relaxed whitespace-pre-line tracking-wide font-medium">
                  {course.description || "Chưa cập nhật mô tả khóa học."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-blue-500/5">
                <div>
                  <span className="text-xs text-slate-450 dark:text-slate-500 font-medium tracking-wide">Danh mục & Cấp độ</span>
                  <div className="flex gap-2 mt-1">
                    {course.category && <Badge variant="gray">{course.category}</Badge>}
                    {course.level && <Badge variant="blue">{course.level}</Badge>}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-450 dark:text-slate-500 font-medium tracking-wide">Người tạo</span>
                  <div className="flex items-center gap-2 mt-2">
                    {course.creator_avatar_url ? (
                      <img 
                        src={course.creator_avatar_url} 
                        alt={course.creator_name || "Creator"} 
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-500/20"
                      />
                    ) : (
                      <User className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 text-slate-500" />
                    )}
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
                      {course.creator_name || "Hệ thống"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </InteractiveGlowCard>

          {/* Section: Compact Roadmap Flow */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-555 dark:text-cyan-400/80">
              Khung chương trình
            </h4>

            {sections.length === 0 ? (
              <InteractiveGlowCard interactive={false} showOffset={false} innerClassName="border-dashed border-2 py-8 bg-transparent">
                <EmptyState
                  icon={<BookOpen className="w-8 h-8 stroke-1" />}
                  title="Chưa có chương học"
                  description="Khóa học này chưa được cấu trúc nội dung."
                  action={
                    <Link
                      href={`/lms/teacher/courses/${course.id}/content`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 rounded-xl transition-all shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Thêm chương mới
                    </Link>
                  }
                />
              </InteractiveGlowCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sections.map((section, index) => (
                  <Link 
                    key={section.id} 
                    href={`/lms/teacher/courses/${course.id}/content?section=${section.id}`}
                  >
                    <InteractiveGlowCard
                      accentColor="cyan"
                      interactive={true}
                      showOffset={true}
                      innerClassName="p-4 flex items-center gap-4 justify-between bg-white dark:bg-[#0F1E35]"
                      className="h-full"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-cyan-950/20 border border-blue-100 dark:border-cyan-500/15 text-blue-600 dark:text-cyan-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate tracking-wide">
                          {section.title}
                        </span>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Badge variant={section.is_published ? "green" : "gray"}>
                          {section.is_published ? "Mở" : "Ẩn"}
                        </Badge>
                      </div>
                    </InteractiveGlowCard>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Span 1): Publishing Readiness Checklist */}
        <div className="space-y-6">
          <InteractiveGlowCard 
            accentColor={readinessPercent === 100 ? "green" : "blue"}
            interactive={false} 
            showOffset={false} 
            innerClassName="p-5 md:p-6 space-y-4 bg-white dark:bg-[#0F1E35]"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-wide">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Độ hoàn thiện khóa học
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hoàn thành các điều kiện bên dưới để chuẩn bị xuất bản khóa học.
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Tiến độ hoàn thiện</span>
                <span className="text-blue-600 dark:text-cyan-400">{readinessPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#0D192E] rounded-full overflow-hidden border border-slate-200/50 dark:border-blue-500/10">
                <div 
                  className="h-full bg-blue-600 dark:bg-cyan-500 transition-all duration-500 rounded-full"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-3 pt-2">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="mt-0.5">
                    {item.checked ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-350 dark:border-slate-700" />
                    )}
                  </div>
                  <span className={`font-medium tracking-wide ${item.checked ? "text-slate-500 dark:text-slate-450 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Creation metadata */}
            <div className="pt-4 border-t border-slate-100 dark:border-blue-500/5 space-y-2 text-xs text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-1.5 font-medium tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Ngày tạo: {new Date(course.created_at).toLocaleDateString("vi-VN")}</span>
              </div>
              {course.published_at && (
                <div className="flex items-center gap-1.5 font-medium tracking-wide">
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ngày xuất bản: {new Date(course.published_at).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
            </div>
          </InteractiveGlowCard>
        </div>

      </div>

    </div>
  );
}