"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Clock,
  Users,
  ChevronRight,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PrimaryBtn } from "../shared/Button";

interface CourseRecommendation {
  course_id: number;
  course_name: string;
  reason: string;
  match_percentage: number;
  difficulty_level: string;
  estimated_hours: number;
  enrollment_count: number;
  skills: string[];
  badges: { text: string; color: string }[];
}

interface DiscoverCoursesResponse {
  message: string;
  recommendations: CourseRecommendation[];
}

interface Props {
  studentId: number;
  onNavigateToCourse?: (courseId: number) => void;
  onEnrollCourse?: (courseId: number) => void;
}

const DIFFICULTY_CONFIG = {
  beginner: {
    label: "Cơ bản",
    color: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20",
  },
  intermediate: {
    label: "Trung bình",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  },
  advanced: {
    label: "Nâng cao",
    color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
  },
};

export function PersonalizedCourseDiscovery({
  studentId,
  onNavigateToCourse,
  onEnrollCourse,
}: Props) {
  const [data, setData] = useState<DiscoverCoursesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const isMounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/lms/personalized-learning/students/${studentId}/recommendations/discover-courses`
      );
      if (!response.ok) {
        throw new Error("Không thể tải gợi ý khóa học");
      }
      const result = await response.json();
      if (isMounted.current) {
        setData(result.data);
        setError("");
      }
    } catch (e: any) {
      if (isMounted.current) {
        setError(e?.message || "Không thể tải dữ liệu gợi ý khóa học");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [studentId]);

  useEffect(() => {
    isMounted.current = true;
    load();
    return () => {
      isMounted.current = false;
    };
  }, [load]);

  const handleEnroll = async (courseId: number) => {
    setEnrolling(courseId);
    try {
      await onEnrollCourse?.(courseId);
    } finally {
      if (isMounted.current) {
        setEnrolling(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-slate-200 dark:bg-[#0D192E] rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
          <div className="h-48 bg-slate-100 dark:bg-[#0D192E]/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  if (!data.recommendations || data.recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
          Chưa có gợi ý khóa học
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hoàn thành thêm bài học để nhận gợi ý phù hợp với bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/10 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-400/8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2 leading-tight">
          <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Khóa học dành cho bạn
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
          {data.message}
        </p>
      </div>

      {/* Courses grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.recommendations.map((course) => {
          const difficultyConfig =
            DIFFICULTY_CONFIG[course.difficulty_level as keyof typeof DIFFICULTY_CONFIG] ||
            DIFFICULTY_CONFIG.intermediate;

          return (
            <div
              key={course.course_id}
              className="group/card bg-white dark:bg-[#0D192E] border border-slate-200 dark:border-blue-500/10 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-md dark:hover:shadow-none transition-all duration-300"
            >
              {/* Match badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-sm">
                    {Math.round(course.match_percentage)}%
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Phù hợp
                    </div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Với kỹ năng của bạn
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                    difficultyConfig.color
                  )}
                >
                  {difficultyConfig.label}
                </span>
              </div>

              {/* Course title */}
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-base mb-2 line-clamp-2 min-h-[3rem]">
                {course.course_name}
              </h4>

              {/* Reason */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                {course.reason}
              </p>

              {/* Badges */}
              {course.badges && course.badges.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {course.badges.slice(0, 2).map((badge, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold border",
                        badge.color === "blue"
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                          : badge.color === "green"
                          ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20"
                          : badge.color === "amber"
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                          : "bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
                      )}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
              )}

              {/* Skills */}
              {course.skills && course.skills.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  <Target className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Kỹ năng:
                  </span>
                  {course.skills.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400"
                    >
                      {skill}
                      {idx < Math.min(course.skills.length, 3) - 1 && ","}
                    </span>
                  ))}
                  {course.skills.length > 3 && (
                    <span className="text-xs text-slate-400">+{course.skills.length - 3}</span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{course.estimated_hours}h</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{course.enrollment_count}</strong> học viên
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToCourse?.(course.course_id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border bg-white dark:bg-[#0F1E35] border-slate-200 dark:border-blue-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162644] active:scale-95 duration-200 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Chi tiết
                </button>
                <button
                  onClick={() => handleEnroll(course.course_id)}
                  disabled={enrolling === course.course_id}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer",
                    enrolling === course.course_id
                      ? "bg-slate-100 dark:bg-[#0D192E] text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 duration-200 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                  )}
                >
                  {enrolling === course.course_id ? (
                    <>
                      <Award className="w-4 h-4 animate-pulse" />
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Đăng ký
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
