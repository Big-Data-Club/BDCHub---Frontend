"use client";

import React from "react";
import { AdminCourseList } from "./AdminCourseList";
import { useAdminStats } from "@/hooks/useAdminStats";
import { LoadingState } from "../LoadingState";
import lmsService from "@/services/lmsService";
import { toast } from "react-hot-toast";
import { Course } from "@/types/course";

export function AdminDashboard() {
  const { courses, loading, error, refresh } = useAdminStats();

  const handleDeleteCourse = async (course: Course) => {
    const reason = window.prompt(
      `Nhập lý do xóa khóa học "${course.title}". Lý do này sẽ được gửi email tới người tạo và tất cả đồng giáo viên:`
    )?.trim();
    if (reason === undefined) {
      return;
    }
    if (reason.length < 5) {
      toast.error("Lý do xóa phải có ít nhất 5 ký tự.");
      return;
    }
    if (!window.confirm("Xác nhận xóa vĩnh viễn khóa học và gửi lý do tới toàn bộ giáo viên?")) return;

    try {
      await lmsService.deleteCourse(course.id, reason);
      toast.success("Đã xóa khóa học thành công");
      refresh();
    } catch (err: any) {
      toast.error("Lỗi khi xóa khóa học: " + err.message);
    }
  };

  const handleArchiveCourse = async (course: Course) => {
    const restoring = course.status === "ARCHIVED";
    const action = restoring ? "khôi phục" : "lưu trữ";
    if (!window.confirm(`${restoring ? "Khôi phục" : "Lưu trữ"} khóa học \"${course.title}\"?`)) return;

    try {
      if (restoring) {
        await lmsService.unarchiveCourse(course.id);
      } else {
        await lmsService.archiveCourse(course.id);
      }
      toast.success(`Đã ${action} khóa học`);
      refresh();
    } catch (err: any) {
      toast.error(`Không thể ${action} khóa học: ${err.message}`);
    }
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button 
          onClick={refresh}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Hệ Thống Quản Trị</h1>
          <div className="flex items-center gap-2 mt-2 text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Chào mừng trở lại, Admin. Hệ thống hiện đang hoạt động bình thường.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <AdminCourseList 
        courses={courses} 
        onDelete={handleDeleteCourse} 
        onArchive={handleArchiveCourse}
      />
    </div>
  );
}
