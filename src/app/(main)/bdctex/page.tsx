"use client";

import React, { useState } from "react";
import { Plus, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLatexProjects } from "@/hooks/useLatexProjects";
import { ProjectCard } from "@/components/bdctex/ProjectCard";
import { ProjectCreateModal } from "@/components/bdctex/ProjectCreateModal";

export default function BDCTexDashboard() {
  const {
    projects,
    loading,
    total,
    page,
    setPage,
    createProject,
    deleteProject,
  } = useLatexProjects();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreateProject = async (data: any) => {
    await createProject(data);
  };

  const limit = 9;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <FileText className="text-blue-600 dark:text-blue-400" size={32} />
            BDCTex Editor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            Soạn thảo LaTeX trực tuyến, biên dịch PDF hiệu suất cao với hơn 1000 package hỗ trợ.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-3 text-sm shadow-sm active:scale-95 transition-all duration-200 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={18} />
          Tạo dự án mới
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 gap-3">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={36} />
          <span className="text-slate-500 dark:text-slate-400 text-sm">Đang tải danh sách dự án...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center text-center max-w-xl mx-auto mt-12 bg-white dark:bg-slate-900/40">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl text-blue-600 dark:text-blue-400 mb-6">
            <FileText size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Không tìm thấy dự án</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm">
            Bạn chưa tạo dự án LaTeX nào. Bắt đầu bằng cách tạo dự án mới từ một template có sẵn!
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-3 text-sm shadow-sm active:scale-95 transition-all duration-200 flex items-center gap-2 mt-6"
          >
            <Plus size={18} />
            Tạo dự án đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creation Modal */}
      <ProjectCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
