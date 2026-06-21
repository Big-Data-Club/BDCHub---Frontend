import React from "react";
import Link from "next/link";
import { Trash2, FileText, Cpu, Calendar, Crown, Edit3, Eye, Shield, Users } from "lucide-react";
import type { LatexProject } from "@/types";

interface ProjectCardProps {
  project: LatexProject;
  onDelete: (id: number) => void;
}

const ROLE_CONFIG = {
  owner:    { label: "Chủ sở hữu", icon: Crown,        badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40" },
  editor:   { label: "Biên soạn",  icon: Edit3,        badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40" },
  reviewer: { label: "Nhận xét",   icon: Shield,       badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40" },
  viewer:   { label: "Chỉ xem",    icon: Eye,          badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" },
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const formattedDate = new Date(project.updated_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const role = project.user_role ?? "owner";
  const isOwner = role === "owner";
  const isShared = role !== "owner";
  const roleCfg = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.viewer;
  const RoleIcon = roleCfg.icon;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-52 relative group">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl shrink-0 ${isShared ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"}`}>
              {isShared ? <Users size={22} /> : <FileText size={22} />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
              {isShared && (
                <span className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">Được chia sẻ với bạn</span>
              )}
            </div>
          </div>

          {/* Role badge */}
          <span className={`shrink-0 ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${roleCfg.badge}`}>
            <RoleIcon size={10} />
            {roleCfg.label}
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 line-clamp-2 min-h-[40px]">
          {project.description || "Không có mô tả dự án."}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            <Cpu size={13} />
            {project.compiler}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Delete only for owner */}
          {isOwner && (
            <button
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xóa dự án "${project.title}"?`)) {
                  onDelete(project.id);
                }
              }}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition-all duration-200"
              title="Xóa dự án"
            >
              <Trash2 size={18} />
            </button>
          )}

          <Link
            href={`/bdctex/${project.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 text-sm shadow-sm active:scale-95 transition-all duration-200 flex items-center gap-1.5"
          >
            {isOwner ? "Mở Editor" : role === "viewer" ? "Xem thôi" : "Mở Editor"}
          </Link>
        </div>
      </div>
    </div>
  );
}
