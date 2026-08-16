"use client";

import { Award, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { Card } from "@/components/lms/shared";
import type { RegistrationTimeline, TeacherCourseStats } from "@/services/analyticsService";

export function TeacherDashboardCharts({
  registrationTimeline,
  courseStats,
}: {
  registrationTimeline: RegistrationTimeline[];
  courseStats: TeacherCourseStats[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="flex h-[350px] min-w-0 flex-col p-5">
        <h3 className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
          <TrendingUp className="h-4 w-4 text-blue-500" />Lượt đăng ký mới của học viên (10 ngày gần đây)
        </h3>
        {registrationTimeline.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-slate-400">Chưa ghi nhận lượt đăng ký mới nào trong 10 ngày gần đây.</div>
        ) : (
          <div className="relative min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTimeline} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="Học viên mới" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="flex h-[350px] min-w-0 flex-col p-5">
        <h3 className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
          <Award className="h-4 w-4 text-purple-500" />So sánh độ hoàn thành & điểm quiz theo khóa học
        </h3>
        {courseStats.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs text-slate-400">Chưa có dữ liệu khóa học đã xuất bản nào để so sánh.</div>
        ) : (
          <div className="relative min-h-0 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseStats.map((stat) => ({ name: stat.title, "Hoàn thành (%)": Math.round(stat.avgProgress), "Điểm Quiz (%)": stat.avgQuiz ? Math.round(stat.avgQuiz) : 0 }))} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Hoàn thành (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Điểm Quiz (%)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
