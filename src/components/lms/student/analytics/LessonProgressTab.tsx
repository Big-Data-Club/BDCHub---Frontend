"use client";

import React, { useMemo } from "react";
import { Layers, BookOpen, ListTodo } from "lucide-react";
import { ProgressBar, Badge, DataTable, ColumnDef } from "@/components/lms/shared";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

interface LessonProgressTabProps {
  lessonProgress: any;
  mounted: boolean;
}

interface SectionStat {
  section: string;
  total: number;
  completed: number;
  percent: number;
}

const sectionColumns: ColumnDef<SectionStat>[] = [
  {
    key: "section",
    header: "Chương học",
    cell: (s) => (
      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px] block" title={s.section}>
        {s.section}
      </span>
    ),
  },
  {
    key: "total",
    header: "Tổng bài",
    align: "center",
    width: "100px",
    cell: (s) => <span className="text-slate-500 dark:text-slate-400">{s.total}</span>,
  },
  {
    key: "completed",
    header: "Đã học",
    align: "center",
    width: "100px",
    cell: (s) => <span className="font-bold text-slate-700 dark:text-slate-300">{s.completed}</span>,
  },
  {
    key: "percent",
    header: "Tiến độ",
    minWidth: "160px",
    cell: (s) => (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar
            value={s.completed}
            max={s.total}
            color={s.percent === 100 ? "green" : "blue"}
            showPercent={false}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-500 dark:text-cyan-400 w-8 text-right">
          {s.percent}%
        </span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    align: "right",
    width: "135px",
    minWidth: "135px",
    cell: (s) => {
      const statusVariant = s.percent === 100 ? "green" : s.percent > 0 ? "blue" : "gray";
      const statusText = s.percent === 100 ? "Đã xong" : s.percent > 0 ? "Đang học" : "Chưa học";
      return <Badge variant={statusVariant}>{statusText}</Badge>;
    },
  },
];

export function LessonProgressTab({ lessonProgress, mounted }: LessonProgressTabProps) {
  const formatData = useMemo(() => {
    if (!lessonProgress || !lessonProgress.by_type) return [];
    const labelMap: Record<string, string> = {
      VIDEO: "Video",
      DOCUMENT: "Tài liệu",
      TEXT: "Bài đọc",
      IMAGE: "Hình ảnh",
      QUIZ: "Trắc nghiệm",
      FORUM: "Thảo luận",
      ANNOUNCEMENT: "Thông báo",
    };
    return lessonProgress.by_type.map((item: any) => ({
      name: labelMap[item.content_type] || item.content_type,
      "Đã học": item.completed,
      "Chưa học": Math.max(0, item.total - item.completed),
      "Tổng số": item.total,
    }));
  }, [lessonProgress]);

  const sectionStats = useMemo<SectionStat[]>(() => {
    if (!lessonProgress || !lessonProgress.by_section) return [];
    return lessonProgress.by_section.map((item: any) => ({
      section: item.section_title,
      total: item.total,
      completed: item.completed,
      percent: item.percent,
    }));
  }, [lessonProgress]);

  const hasNoContent = !lessonProgress || lessonProgress.total_content === 0;

  return (
    <div className="space-y-8" role="tabpanel">
      {/* 1. Theo loại học liệu (Clean Premium Panel) */}
      <div className="bg-white dark:bg-[#0F1E35] border border-slate-200 dark:border-blue-500/12 rounded-2xl p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-blue-500/25 transition-all duration-300">
        <div className="flex flex-col h-[300px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Theo loại học liệu
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Phân bố bài học theo định dạng nội dung</p>
            </div>
          </div>
          {hasNoContent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">Chưa có bài học nào trong khóa học này.</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 w-full relative">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatData} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-blue-900/30" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "16px", background: "rgba(15, 30, 53, 0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.2)", color: "#fff", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="Đã học" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Chưa học" fill="#cbd5e1" stackId="a" radius={[4, 4, 0, 0]} className="dark:fill-[#1E293B]" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Tiến độ theo chương học (Unified DataTable) */}
      <div className="pt-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
            <ListTodo className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Tiến độ theo chương học
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tỷ lệ hoàn thành nội dung từng phần</p>
          </div>
        </div>
        
        <DataTable<SectionStat>
          data={sectionStats}
          columns={sectionColumns}
          keyExtractor={(_, idx) => idx}
          variant="flat"
          emptyState={
            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-blue-500/10 rounded-2xl">
              <ListTodo className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">Chưa có chương học nào được cấu hình.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
