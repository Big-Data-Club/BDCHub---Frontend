"use client";
import Link from "next/link";
import { useFlashcardCourses } from "@/hooks/lms/student/useFlashcardCourses";
import { FlashcardLibrary } from "./FlashcardLibrary";
import { button, panel, primary } from "./styles";
export function FlashcardWorkspace() {
  const c = useFlashcardCourses();
  if (c.loading) return <div role="status" className="p-8 text-slate-600 dark:text-slate-300">Đang tải khóa học…</div>;
  if (c.error) return <div role="alert" className={`${panel} m-6 space-y-4 text-slate-900 dark:text-slate-100`}><p>{c.error}</p><button className={button} onClick={c.retry}>Thử lại</button></div>;
  if (!c.courseId) return <div className={`${panel} m-6 space-y-4 text-slate-900 dark:text-slate-100`}><h1 className="text-2xl font-bold">Flashcard</h1><p>Bạn chưa tham gia khóa học nào.</p><Link className={primary} href="/lms/student/discover">Khám phá khóa học</Link></div>;
  return <FlashcardLibrary key={c.courseId} courseId={c.courseId} courses={c.courses} onCourse={c.select} />;
}
