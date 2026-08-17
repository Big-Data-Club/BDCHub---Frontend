"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Gauge, Pause, Play, RotateCcw, Sprout } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { ExperimentDefinition, StemTrialResult } from "@/types";
import { ChemistryCanvasStage } from "./chemistry/ChemistryCanvasStage";

type Props = {
  definition: ExperimentDefinition;
  result: StemTrialResult;
  comparison?: StemTrialResult;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function StemSimulationStage({ definition, result, comparison }: Props) {
  const reduceMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setFrame(0);
    setPlaying(false);
    setShowComparison(false);
  }, [result.trialId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setFrame(current => {
        if (current >= result.points.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, reduceMotion ? 900 : 650 / speed);
    return () => window.clearInterval(timer);
  }, [playing, reduceMotion, result.points.length, speed]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  const current = result.points[Math.min(frame, result.points.length - 1)];
  const comparisonPoint = comparison?.points[Math.min(frame, comparison.points.length - 1)];
  const progress = result.points.length > 1 ? frame / (result.points.length - 1) : 1;
  const transition = reduceMotion ? "none" : "all 500ms cubic-bezier(.2,.8,.2,1)";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${playing ? `${reduceMotion ? "" : "animate-pulse"} bg-emerald-400` : "bg-slate-500"}`} />
          <div>
            <p className="text-xs font-bold text-slate-200">Mô phỏng 2.5D · Trial {result.trialNumber}</p>
            <p className="text-[10px] text-slate-500">{definition.modelVersion} · {result.engineVersion} · seed {result.seed}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {comparison && (
            <button
              type="button"
              onClick={() => setShowComparison(value => !value)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${showComparison ? "border-violet-500 bg-violet-950 text-violet-200" : "border-slate-700 text-slate-400 hover:bg-slate-800"}`}
              aria-pressed={showComparison}
            >
              {showComparison ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              So sánh trial {comparison.trialNumber}
            </button>
          )}
          <span className="rounded-lg border border-amber-900/60 bg-amber-950/40 px-2.5 py-1.5 text-[10px] font-bold text-amber-300">CONCEPT MODEL</span>
        </div>
      </div>

      <div className="relative aspect-[16/8.2] min-h-[260px] w-full overflow-hidden">
        {result.domain === "CHEMISTRY" ? (
          <ChemistryCanvasStage
            spec={
              (definition as any).chemistrySpec || {
                labType: "CHEMISTRY",
                title: (definition as any).title || "Thí nghiệm Hóa Học Ảo",
                workspace: { viewMode: "2.5D", benchWidth: 1200, benchHeight: 700 },
                substances: [],
                equipments: [],
                reactions: [],
                evaluationCriteria: [],
              }
            }
          />
        ) : result.domain === "PLANT" ? (
          <PlantScene
            definition={definition}
            result={result}
            currentValue={current.y}
            comparisonValue={showComparison ? comparisonPoint?.y : undefined}
            progress={progress}
            transition={transition}
          />
        ) : (
          <RobotScene
            definition={definition}
            result={result}
            currentPoint={current}
            comparisonPoint={showComparison ? comparisonPoint : undefined}
            progress={progress}
            transition={transition}
          />
        )}
        <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">{result.xLabel}</p>
          <p className="text-lg font-black text-white">{current.x}</p>
        </div>
        <div className="pointer-events-none absolute right-4 top-4 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-right backdrop-blur">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">{result.yLabel}</p>
          <p className="text-lg font-black text-emerald-300">{current.y}</p>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-800 bg-slate-900/90 px-4 py-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, result.points.length - 1)}
          step={1}
          value={frame}
          onChange={event => {
            setPlaying(false);
            setFrame(Number(event.target.value));
          }}
          className="w-full accent-emerald-500"
          aria-label="Dòng thời gian mô phỏng"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (frame >= result.points.length - 1) setFrame(0);
                setPlaying(value => !value);
              }}
              className="inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-500"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Tạm dừng" : "Chạy"}
            </button>
            <button type="button" onClick={() => { setPlaying(false); setFrame(0); }} className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:bg-slate-800" aria-label="Đưa mô phỏng về đầu">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950 p-1">
            <Gauge className="ml-1 h-3.5 w-3.5 text-slate-500" />
            {[1, 2, 5].map(value => (
              <button key={value} type="button" onClick={() => setSpeed(value)} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${speed === value ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}>{value}×</button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlantScene({ definition, result, currentValue, comparisonValue, progress, transition }: {
  definition: ExperimentDefinition;
  result: StemTrialResult;
  currentValue: number;
  comparisonValue?: number;
  progress: number;
  transition: string;
}) {
  const dependent = definition.variables.find(variable => variable.role === "DEPENDENT");
  const independent = definition.variables.find(variable => variable.role === "INDEPENDENT");
  const maxValue = Math.max(...result.points.map(point => point.y), Number(dependent?.maxValue || 1) * 0.35, 1);
  const growth = clamp(currentValue / maxValue);
  const plantHeight = 45 + growth * 175;
  const configValue = Number(result.config[independent?.key || ""] || 0);
  const inputSpan = Math.max(1, Number(independent?.maxValue || 100) - Number(independent?.minValue || 0));
  const moisture = clamp((configValue - Number(independent?.minValue || 0)) / inputSpan);
  const stress = Math.abs(moisture - 0.55) > 0.37;
  const leafColor = stress ? "#a3a341" : "#3fb950";
  const showBloom = progress > 0.72;
  const leafPairs = Math.max(1, Math.floor(1 + progress * 4));

  return (
    <svg viewBox="0 0 800 410" className="h-full w-full" role="img" aria-label={`Cây mô phỏng tại ${result.xLabel} ${result.points[Math.round(progress * (result.points.length - 1))]?.x}`}>
      <defs>
        <linearGradient id="plant-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#102a43" /><stop offset="1" stopColor="#164e63" /></linearGradient>
        <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop stopColor={moisture > .5 ? "#533a2e" : "#76543f"} /><stop offset="1" stopColor={moisture > .5 ? "#292018" : "#4a3529"} /></linearGradient>
        <filter id="plant-shadow"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <rect width="800" height="410" fill="url(#plant-sky)" />
      <circle cx="665" cy="72" r="38" fill="#fde68a" opacity=".9" />
      <circle cx="665" cy="72" r="60" fill="#fde68a" opacity=".09" />
      <path d="M0 250 C130 220 210 270 350 240 C500 210 650 255 800 225 V410 H0Z" fill="#163c35" />
      <ellipse cx="400" cy="372" rx="150" ry="22" fill="#020617" opacity=".45" filter="url(#plant-shadow)" />

      <g opacity=".45" stroke="#a16207" strokeWidth="3" fill="none">
        <path d="M400 294 C385 320 370 340 348 358" />
        <path d="M400 302 C416 323 438 341 456 360" />
        <path d="M392 317 C382 337 389 352 397 368" />
        <path d="M410 320 C422 340 417 354 414 370" />
      </g>
      <path d="M310 292 L490 292 L465 378 Q400 402 335 378Z" fill="#9a4f2f" stroke="#d97745" strokeWidth="4" />
      <ellipse cx="400" cy="292" rx="92" ry="23" fill="url(#soil)" stroke="#c56b43" strokeWidth="4" />
      <rect x="320" y="365" width="160" height="10" rx="5" fill="#6f3826" opacity=".8" />

      <g style={{ transition }}>
        <path d={`M400 292 C395 ${275 - plantHeight * .35} 407 ${292 - plantHeight * .7} 400 ${292 - plantHeight}`} fill="none" stroke="#43a047" strokeWidth="8" strokeLinecap="round" />
        {Array.from({ length: leafPairs }).map((_, index) => {
          const y = 270 - index * (plantHeight / 5);
          const scale = .7 + index * .08;
          return <g key={index} style={{ transition }}>
            <path d={`M400 ${y} C${375 - scale * 18} ${y - 22} ${350 - scale * 20} ${y - 13} ${355 - scale * 7} ${y + 5} C370 ${y + 16} 388 ${y + 10} 400 ${y}`} fill={leafColor} stroke="#8bd17c" strokeWidth="2" />
            <path d={`M402 ${y - 9} C${425 + scale * 17} ${y - 32} ${453 + scale * 17} ${y - 20} ${445 + scale * 5} ${y - 2} C430 ${y + 9} 414 ${y + 3} 402 ${y - 9}`} fill={leafColor} stroke="#8bd17c" strokeWidth="2" />
          </g>;
        })}
        {showBloom && <g transform={`translate(400 ${286 - plantHeight})`} style={{ transition }}>
          {[0, 60, 120, 180, 240, 300].map(angle => <ellipse key={angle} rx="12" ry="25" fill="#f9a8d4" opacity=".95" transform={`rotate(${angle}) translate(0 -15)`} />)}
          <circle r="11" fill="#facc15" />
        </g>}
      </g>

      {comparisonValue !== undefined && <g opacity=".55" stroke="#c084fc" fill="none" strokeDasharray="7 6">
        <path d={`M525 292 L525 ${292 - (45 + clamp(comparisonValue / maxValue) * 175)}`} strokeWidth="5" />
        <circle cx="525" cy={292 - (45 + clamp(comparisonValue / maxValue) * 175)} r="12" strokeWidth="3" />
        <text x="545" y="235" fill="#d8b4fe" stroke="none" fontSize="12">Trial trước</text>
      </g>}

      <g transform="translate(52 300)">
        <rect width="170" height="68" rx="14" fill="#020617" opacity=".74" stroke="#334155" />
        <Sprout x="14" y="16" width="28" height="28" color="#4ade80" />
        <text x="52" y="25" fill="#94a3b8" fontSize="11">Độ ẩm mô hình</text>
        <text x="52" y="47" fill="#e2e8f0" fontSize="17" fontWeight="700">{Math.round(moisture * 100)}%</text>
        <rect x="14" y="54" width="142" height="5" rx="3" fill="#1e293b" /><rect x="14" y="54" width={142 * moisture} height="5" rx="3" fill="#38bdf8" />
      </g>
      {stress && <text x="400" y="35" textAnchor="middle" fill="#fde68a" fontSize="13" fontWeight="700">⚠ Cây đang biểu hiện stress trong mô hình</text>}
    </svg>
  );
}

function RobotScene({ definition, result, currentPoint, comparisonPoint, progress, transition }: {
  definition: ExperimentDefinition;
  result: StemTrialResult;
  currentPoint: { x: number; y: number };
  comparisonPoint?: { x: number; y: number };
  progress: number;
  transition: string;
}) {
  const independent = definition.variables.find(variable => variable.role === "INDEPENDENT");
  const power = Number(result.config[independent?.key || ""] || 0);
  const powerSpan = Math.max(1, Number(independent?.maxValue || 100) - Number(independent?.minValue || 0));
  const powerRatio = clamp((power - Number(independent?.minValue || 0)) / powerSpan);
  const robotX = 118 + progress * 550;
  const robotY = 286 - Math.sin(progress * Math.PI) * 72;
  const compareProgress = comparisonPoint ? clamp(comparisonPoint.y / 100) : 0;
  const compareX = 118 + compareProgress * 550;
  const compareY = 286 - Math.sin(compareProgress * Math.PI) * 72;
  const wheelRotation = progress * 1440;

  return (
    <svg viewBox="0 0 800 410" className="h-full w-full" role="img" aria-label={`Robot đã hoàn thành ${currentPoint.y}% quãng đường`}>
      <defs><linearGradient id="robot-bg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#071a2d" /><stop offset="1" stopColor="#152442" /></linearGradient><filter id="robot-glow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <rect width="800" height="410" fill="url(#robot-bg)" />
      <g stroke="#1e4064" strokeWidth="1" opacity=".55">
        {Array.from({ length: 15 }).map((_, index) => <path key={`v${index}`} d={`M${50 + index * 55} 345 L${210 + index * 35} 105`} />)}
        {Array.from({ length: 9 }).map((_, index) => <path key={`h${index}`} d={`M35 ${360 - index * 30} L765 ${360 - index * 30}`} />)}
      </g>
      <path d="M95 303 C250 303 265 180 405 205 C520 225 555 302 705 268" fill="none" stroke="#0f172a" strokeWidth="70" strokeLinecap="round" />
      <path d="M95 303 C250 303 265 180 405 205 C520 225 555 302 705 268" fill="none" stroke="#334155" strokeWidth="54" strokeLinecap="round" />
      <path d="M95 303 C250 303 265 180 405 205 C520 225 555 302 705 268" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="13 15" opacity=".7" />
      <path d={`M118 286 C${180 + progress * 80} ${286 - progress * 110} ${300 + progress * 150} ${235 - progress * 20} ${robotX} ${robotY}`} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" opacity=".75" filter="url(#robot-glow)" />

      <g transform="translate(695 215)"><path d="M0 60 V0" stroke="#e2e8f0" strokeWidth="5" /><path d="M5 4 L52 18 L5 34Z" fill="#f43f5e" /><rect x="-12" y="58" width="35" height="8" rx="4" fill="#64748b" /></g>
      <g transform={`translate(${robotX} ${robotY})`} style={{ transition }}>
        <path d="M-60 -28 L25 -40 L62 -13 L-20 2Z" fill="#0e7490" stroke="#67e8f9" strokeWidth="3" />
        <path d="M-20 2 L62 -13 L52 28 L-30 42Z" fill="#155e75" stroke="#22d3ee" strokeWidth="3" />
        <circle cx="-27" cy="28" r="18" fill="#111827" stroke="#64748b" strokeWidth="5" /><path d="M-27 16 V40 M-39 28 H-15" stroke="#cbd5e1" strokeWidth="3" transform={`rotate(${wheelRotation} -27 28)`} />
        <circle cx="45" cy="17" r="18" fill="#111827" stroke="#64748b" strokeWidth="5" /><path d="M45 5 V29 M33 17 H57" stroke="#cbd5e1" strokeWidth="3" transform={`rotate(${wheelRotation} 45 17)`} />
        <rect x="-20" y="-28" width="30" height="20" rx="5" fill="#020617" stroke="#38bdf8" /><circle cx="-12" cy="-18" r="4" fill="#4ade80" /><circle cx="2" cy="-18" r="4" fill="#4ade80" />
        <path d="M15 -22 L100 -55 M15 -18 L112 -18 M15 -14 L95 20" stroke="#22d3ee" strokeWidth="2" opacity=".34" strokeDasharray="6 5" />
      </g>

      {comparisonPoint && <g transform={`translate(${compareX} ${compareY})`} opacity=".55"><circle r="24" fill="#7e22ce" stroke="#d8b4fe" strokeWidth="3" strokeDasharray="6 4" /><text x="0" y="4" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">T-{comparisonPoint.y}%</text></g>}

      <g transform="translate(48 52)">
        <rect width="176" height="74" rx="14" fill="#020617" opacity=".78" stroke="#334155" />
        <text x="16" y="23" fill="#94a3b8" fontSize="11">{independent?.displayName || "Công suất"}</text>
        <text x="16" y="49" fill="#67e8f9" fontSize="20" fontWeight="800">{power} {independent?.unit}</text>
        <rect x="16" y="60" width="144" height="5" rx="3" fill="#1e293b" /><rect x="16" y="60" width={144 * powerRatio} height="5" rx="3" fill="#06b6d4" />
      </g>
      <g transform="translate(585 340)"><rect width="168" height="42" rx="12" fill="#020617" opacity=".78" stroke="#334155" /><text x="14" y="17" fill="#94a3b8" fontSize="10">Tiến độ đường chạy</text><text x="14" y="34" fill="#e2e8f0" fontSize="15" fontWeight="800">{currentPoint.y}%</text><rect x="68" y="21" width="84" height="6" rx="3" fill="#1e293b" /><rect x="68" y="21" width={84 * clamp(currentPoint.y / 100)} height="6" rx="3" fill="#22d3ee" /></g>
    </svg>
  );
}
