"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

/** Chat keeps a compact launch card; the full editable wizard lives on its own route. */
export function CourseBlueprintLaunchCard() {
  const router = useRouter();
  return <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900/70 dark:bg-violet-950/20">
    <div className="flex gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" /><div><h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tạo khóa học từ tài liệu</h3><p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">Tải nhiều giáo trình, xem roadmap AI có thể sửa, rồi duyệt hoặc hủy — chưa có khóa học nào được tạo lúc này.</p><button onClick={() => router.push("/lms/teacher/courses/create")} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700">Mở không gian tạo course <ArrowRight className="h-3.5 w-3.5" /></button></div></div>
  </div>;
}
