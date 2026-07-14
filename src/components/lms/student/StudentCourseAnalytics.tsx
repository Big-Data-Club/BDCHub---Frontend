"use client";

import React from "react";
import { Brain, Target, ListTodo } from "lucide-react";
import { Card, PageLoader } from "@/components/lms/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Enrollment } from "@/types";
import { LessonProgressTab } from "./analytics/LessonProgressTab";
import { MasteryTab } from "./analytics/MasteryTab";
import { FlashcardTab } from "./analytics/FlashcardTab";

interface StudentCourseAnalyticsProps {
  selectedCourseId: number | null;
  currentCourseTitle?: string;
  acceptedEnrollments: Enrollment[];
  setSelectedCourseId: (id: number) => void;
  loadingAnalytics: boolean;
  analyticsTab: "lessons" | "mastery" | "flashcards";
  setAnalyticsTab: (tab: "lessons" | "mastery" | "flashcards") => void;
  heatmapData: any[];
  flashcardStats: any;
  quizScores: any[];
  lessonProgress: any;
  microInteractions: any;
  spacedRepQuizzes: any;
  mounted: boolean;
}

export function StudentCourseAnalytics({
  selectedCourseId,
  currentCourseTitle,
  acceptedEnrollments,
  setSelectedCourseId,
  loadingAnalytics,
  analyticsTab,
  setAnalyticsTab,
  heatmapData,
  flashcardStats,
  quizScores,
  lessonProgress,
  microInteractions,
  spacedRepQuizzes,
  mounted,
}: StudentCourseAnalyticsProps) {
  if (!selectedCourseId) {
    return (
      <Card className="p-8 text-center bg-slate-50 dark:bg-[#0F1E35] border border-dashed border-slate-250 dark:border-blue-500/20 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
        <Target className="w-12 h-12 text-slate-400 dark:text-slate-650 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Chưa chọn khóa học nào</h3>
        <p className="text-sm text-slate-500 mt-1">Chọn một khóa học để xem các phân tích.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter / Selected Course Name */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-blue-500/10 pb-4 gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 truncate" title={currentCourseTitle}>
            {currentCourseTitle || `Chi tiết Khóa học #${selectedCourseId}`}
          </h3>
        </div>

        <div className="lg:hidden w-full sm:w-auto">
          <Select
            value={selectedCourseId ? String(selectedCourseId) : ""}
            onValueChange={(val) => setSelectedCourseId(Number(val))}
          >
            <SelectTrigger className="w-full sm:w-[240px] h-10 border border-slate-250 dark:border-blue-500/20 rounded-xl text-sm bg-white dark:bg-[#0D192E] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-cyan-400/20 transition-all flex-shrink-0 font-semibold shadow-sm">
              <SelectValue placeholder="Chọn khóa học" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0D192E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
              {acceptedEnrollments.map((e) => (
                <SelectItem key={e.course_id} value={String(e.course_id)} className="cursor-pointer">
                  {e.course_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingAnalytics ? (
        <PageLoader message="Đang tải dữ liệu khóa học..." />
      ) : (
        <div className="space-y-6">
          {/* Tab selector buttons */}
          <div className="flex pb-1 mb-8 overflow-x-auto" role="tablist">
            <div className="inline-flex p-1 bg-slate-100/80 dark:bg-lms-input border border-slate-200/60 dark:border-blue-500/10 rounded-2xl gap-1">
              <button
                role="tab"
                aria-selected={analyticsTab === "lessons"}
                onClick={() => setAnalyticsTab("lessons")}
                className={`flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 ${analyticsTab === "lessons"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200 dark:bg-cyan-500 dark:text-slate-950 dark:border-transparent dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-blue-900/20"
                  }`}
              >
                <ListTodo className="w-4 h-4" />
                Tiến độ bài học
              </button>
              <button
                role="tab"
                aria-selected={analyticsTab === "mastery"}
                onClick={() => setAnalyticsTab("mastery")}
                className={`flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 ${analyticsTab === "mastery"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200 dark:bg-cyan-500 dark:text-slate-950 dark:border-transparent dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-blue-900/20"
                  }`}
              >
                <Target className="w-4 h-4" />
                Năng lực & Quiz
              </button>
              <button
                role="tab"
                aria-selected={analyticsTab === "flashcards"}
                onClick={() => setAnalyticsTab("flashcards")}
                className={`flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 ${analyticsTab === "flashcards"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200 dark:bg-cyan-500 dark:text-slate-950 dark:border-transparent dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-blue-900/20"
                  }`}
              >
                <Brain className="w-4 h-4" />
                Ghi nhớ (Flashcard)
              </button>
            </div>
          </div>

          {/* Render Tabs content */}
          {analyticsTab === "lessons" && (
            <LessonProgressTab
              lessonProgress={lessonProgress}
              mounted={mounted}
            />
          )}

          {analyticsTab === "mastery" && (
            <MasteryTab
              heatmapData={heatmapData}
              quizScores={quizScores}
              microInteractions={microInteractions}
              spacedRepQuizzes={spacedRepQuizzes}
              mounted={mounted}
            />
          )}

          {analyticsTab === "flashcards" && (
            <FlashcardTab
              flashcardStats={flashcardStats}
              mounted={mounted}
            />
          )}
        </div>
      )}
    </div>
  );
}
