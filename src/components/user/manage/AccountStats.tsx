import { UserResponse } from "@/services/userService";

interface AccountStatsProps {
  fullUserData: UserResponse | null;
}

interface StatItemProps {
  value: string | number;
  label: string;
  colorClass: string;
}

function StatItem({ value, label, colorClass }: StatItemProps) {
  return (
    <div className="text-center py-2">
      <div className={`text-3xl font-extrabold leading-tight ${colorClass}`}>{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">{label}</div>
    </div>
  );
}

export default function AccountStats({ fullUserData }: AccountStatsProps) {
  return (
    <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-5">
        Account Statistics
      </h3>
      <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
        <StatItem
          value={fullUserData?.totalScore ?? 0}
          label="Total Score"
          colorClass="text-blue-600 dark:text-blue-400"
        />
        <StatItem
          value={fullUserData?.active ? "Active" : "Inactive"}
          label="Status"
          colorClass={
            fullUserData?.active
              ? "text-green-600 dark:text-green-400"
              : "text-slate-400 dark:text-slate-600"
          }
        />
        <StatItem
          value={fullUserData?.team || "N/A"}
          label="Team"
          colorClass="text-slate-700 dark:text-slate-300"
        />
      </div>
    </div>
  );
}
