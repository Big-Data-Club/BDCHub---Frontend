"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

interface PerformanceChartProps {
  props: {
    type: "student" | "class";
    course_id?: number;
    student_id?: number;
    heatmap: any[];
    avg_mastery?: number;
  };
}

export function PerformanceChart({ props }: PerformanceChartProps) {
  const { type, heatmap, avg_mastery } = props;

  // Prepare data for recharts
  const chartData = heatmap.map((entry) => ({
    name: entry.node_name,
    mastery: type === "student" ? entry.mastery_level * 100 : entry.avg_mastery * 100,
    wrong_rate: type === "student" ? (entry.wrong_count / entry.total_attempts) * 100 : entry.wrong_rate,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Mastery: <span className="font-semibold text-blue-600">{payload[0].value.toFixed(1)}%</span>
              </p>
            </div>
            {payload[1] && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {type === "student" ? "Error Rate" : "Class Error Rate"}: <span className="font-semibold text-red-500">{payload[1].value.toFixed(1)}%</span>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const criticalCount = chartData.filter(d => d.mastery < 50).length;

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {type === "student" ? "Cá nhân" : "Cả lớp"} Performance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chartData.length} chủ đề kiến thức quan trọng
            </p>
          </div>
        </div>

        {avg_mastery !== undefined && (
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Avg Mastery</div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {(avg_mastery * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-blue-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Top Topic</div>
            <div className="text-sm font-bold truncate max-w-[120px]">
              {chartData.length > 0 ? chartData.reduce((prev, curr) => prev.mastery > curr.mastery ? prev : curr).name : "N/A"}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl ${criticalCount > 0 ? 'ring-1 ring-red-500/20' : ''}`}>
          <div className={criticalCount > 0 ? "text-red-500" : "text-green-500"}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Weak Areas</div>
            <div className="text-sm font-bold">
              {criticalCount} Topics
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full p-4 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748B' }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748B' }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
            <Bar dataKey="mastery" radius={[4, 4, 0, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.mastery > 70 ? '#3B82F6' : entry.mastery > 40 ? '#F59E0B' : '#EF4444'} 
                />
              ))}
            </Bar>
            <Bar dataKey="wrong_rate" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={8} opacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-center text-slate-400 uppercase font-medium">
          Dữ liệu master thực tế dựa trên kết quả làm quiz của học viên
        </p>
      </div>
    </div>
  );
}
