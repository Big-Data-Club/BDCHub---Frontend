"use client";

import React from "react";
import { AdminCourseList } from "./AdminCourseList";
import { useAdminStats } from "@/hooks/useAdminStats";
import { LoadingState } from "../LoadingState";
import lmsService from "@/services/lmsService";
import { toast } from "react-hot-toast";

export function AdminDashboard() {
  const { courses, loading, error, refresh } = useAdminStats();

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      await lmsService.deleteCourse(id);
      toast.success("Đã xóa khóa học thành công");
      refresh();
    } catch (err: any) {
      toast.error("Lỗi khi xóa khóa học: " + err.message);
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
      />
    </div>
  );
}
