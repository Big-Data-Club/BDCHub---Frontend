// frontend/src/components/labs/chemistry/TitrationCurveWidget.tsx
"use client";

import { useMemo } from "react";
import type { TitrationDataPoint } from "@/types/labs/chemistry";
import { Activity } from "lucide-react";

interface Props {
  data: TitrationDataPoint[];
  equivalenceVolMl?: number;
  className?: string;
}

export function TitrationCurveWidget({ data, equivalenceVolMl, className }: Props) {
  const pointsString = useMemo(() => {
    if (!data || data.length === 0) return "";
    const maxVol = Math.max(50, ...data.map((d) => d.volumeAddedMl));
    return data
      .map((d) => {
        const x = (d.volumeAddedMl / maxVol) * 280 + 35;
        const y = 160 - (d.ph / 14.0) * 140;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  const lastPoint = data && data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className={`rounded-xl border border-slate-700 bg-slate-900/90 p-3 shadow-xl ${className || ""}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span>Đường cong chuẩn độ pH (Titration Curve)</span>
        </div>
        {lastPoint && (
          <span className="rounded bg-blue-950 border border-blue-800 px-2 py-0.5 text-[11px] font-mono text-cyan-300">
            pH = {lastPoint.ph.toFixed(2)} | V = {lastPoint.volumeAddedMl.toFixed(1)} mL
          </span>
        )}
      </div>

      <div className="relative aspect-[2/1] w-full min-h-[140px]">
        <svg viewBox="0 0 330 180" className="h-full w-full overflow-visible text-xs">
          {/* Axis Grid */}
          <line x1="35" y1="20" x2="35" y2="160" stroke="#475569" strokeWidth="1.5" />
          <line x1="35" y1="160" x2="315" y2="160" stroke="#475569" strokeWidth="1.5" />

          {/* pH Grid ticks (0, 7, 14) */}
          <line x1="30" y1="160" x2="315" y2="160" stroke="#334155" strokeDasharray="3 3" />
          <text x="12" y="163" fill="#94a3b8" fontSize="10">0</text>

          <line x1="30" y1="90" x2="315" y2="90" stroke="#334155" strokeDasharray="3 3" />
          <text x="12" y="93" fill="#38bdf8" fontSize="10">7</text>

          <line x1="30" y1="20" x2="315" y2="20" stroke="#334155" strokeDasharray="3 3" />
          <text x="10" y="23" fill="#94a3b8" fontSize="10">14</text>

          {/* X Axis Labels */}
          <text x="35" y="175" fill="#94a3b8" fontSize="10">0</text>
          <text x="160" y="175" fill="#94a3b8" fontSize="10">25 mL</text>
          <text x="290" y="175" fill="#94a3b8" fontSize="10">50 mL</text>

          {/* Equivalence Volume Line */}
          {equivalenceVolMl && (
            <line
              x1={(equivalenceVolMl / 50) * 280 + 35}
              y1="20"
              x2={(equivalenceVolMl / 50) * 280 + 35}
              y2="160"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
          )}

          {/* Titration Polyline */}
          {pointsString && (
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
