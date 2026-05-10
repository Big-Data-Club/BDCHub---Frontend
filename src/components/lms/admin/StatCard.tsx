"use client";

export function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = "blue",
  trend 
}: { 
  icon: string; 
  title: string; 
  value: number; 
  subtitle: string;
  color?: string;
  trend?: "up" | "down" | "warning";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center text-2xl shadow-sm`}>
          {icon}
        </div>
        {trend === "warning" && (
          <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full border border-yellow-200 dark:border-yellow-800">
            Cần xử lý
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}