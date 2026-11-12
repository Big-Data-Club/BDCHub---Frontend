"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-blue-500/10 dark:bg-[#0F1E35]";
interface QuizResultChartsProps {
  gradedCount: number;
  distribution: { label: string; count: number }[];
  questionChart: {
    label: string;
    correct: number;
    incorrect: number;
    pending: number;
    skipped: number;
  }[];
}
export function QuizResultCharts({
  gradedCount,
  distribution,
  questionChart,
}: QuizResultChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={panel}>
        <h2 className="mb-4 font-semibold">
          Phân bố điểm · {gradedCount} lượt đã chấm
        </h2>
        <div
          className="h-64 text-slate-600 dark:text-slate-400"
          role="img"
          aria-label="Biểu đồ phân bố điểm, dữ liệu chi tiết trong bảng bên dưới"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                }}
              />
              <Bar
                dataKey="count"
                name="Số lượt"
                fill="#2563eb"
                isAnimationActive={false}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className={panel}>
        <h2 className="mb-4 font-semibold">Kết quả từng câu</h2>
        <div
          className="h-64 text-slate-600 dark:text-slate-400"
          role="img"
          aria-label="Biểu đồ kết quả từng câu, dữ liệu chi tiết trong bảng bên dưới"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={questionChart}>
              <XAxis
                dataKey="label"
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                }}
              />
              <Bar
                isAnimationActive={false}
                dataKey="correct"
                name="Đúng"
                stackId="a"
                fill="#16a34a"
              />
              <Bar
                isAnimationActive={false}
                dataKey="incorrect"
                name="Sai"
                stackId="a"
                fill="#dc2626"
              />
              <Bar
                isAnimationActive={false}
                dataKey="pending"
                name="Chờ chấm"
                stackId="a"
                fill="#d97706"
              />
              <Bar
                isAnimationActive={false}
                dataKey="skipped"
                name="Bỏ trống"
                stackId="a"
                fill="#64748b"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Đúng · Sai · Chờ chấm · Bỏ trống (xem nhãn khi trỏ vào cột)
        </p>
      </section>
    </div>
  );
}
