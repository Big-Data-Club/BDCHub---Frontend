// frontend/src/components/labs/chemistry/ChemistryCanvasStage.tsx
"use client";

import { useEffect, useState } from "react";
import type { ChemistryLabSpec, TitrationDataPoint, VesselState } from "@/types/labs/chemistry";
import { ChemistryEngine } from "@/services/labs/chemistryEngine";
import { TitrationCurveWidget } from "./TitrationCurveWidget";
import { Play, Pause, RotateCcw, Droplet, Thermometer, Gauge } from "lucide-react";

interface Props {
  spec: ChemistryLabSpec;
  onStateUpdate?: (vesselStates: Record<string, VesselState>) => void;
}

export function ChemistryCanvasStage({ spec, onStateUpdate }: Props) {
  const [engine] = useState(() => new ChemistryEngine(spec));
  const [isDripping, setIsDripping] = useState(false);
  const [dripRate] = useState(2); // drops per second
  const [dispensedMl, setDispensedMl] = useState(0);
  const [titrationHistory, setTitrationHistory] = useState<TitrationDataPoint[]>([]);

  const buretteEq = spec.equipments.find((e) => e.type === "burette");
  const flaskEq = spec.equipments.find((e) => e.type === "erlenmeyer_flask" || e.type === "beaker");

  const flaskState = flaskEq ? engine.getVesselState(flaskEq.id) : null;

  // Drip interval loop
  useEffect(() => {
    if (!isDripping || !buretteEq || !flaskEq) return;

    const intervalMs = Math.max(50, 1000 / dripRate);
    const timer = setInterval(() => {
      const dropVolumeMl = 0.05; // Standard 1 drop = 0.05 mL

      const titrantSubstanceId = buretteEq.filledSubstanceId || "naoh_sol";
      const updatedFlask = engine.addLiquidToVessel(
        flaskEq.id,
        titrantSubstanceId,
        dropVolumeMl
      );
      if (onStateUpdate) {
        onStateUpdate({ [flaskEq.id]: updatedFlask });
      }

      setDispensedMl((prev) => {
        const nextVol = prev + dropVolumeMl;
        setTitrationHistory((h) => [
          ...h,
          {
            volumeAddedMl: nextVol,
            ph: updatedFlask.ph,
            temperatureC: updatedFlask.temperatureC,
            colorRgba: updatedFlask.colorRgba,
          },
        ]);
        return nextVol;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isDripping, dripRate, buretteEq, flaskEq, engine]);

  const handleReset = () => {
    setIsDripping(false);
    setDispensedMl(0);
    setTitrationHistory([]);
    engine.initFromSpec(spec);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl">
      {/* Top Header & Stage Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            Sân khấu Thí nghiệm 2.5D · {spec.title}
          </h3>
          <p className="text-xs text-slate-400">
            Kéo thả dụng cụ, điều chỉnh van buret và quan sát hiện tượng hóa học theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          {buretteEq && (
            <button
              onClick={() => setIsDripping((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isDripping
                  ? "bg-amber-600 text-white hover:bg-amber-500"
                  : "bg-cyan-600 text-white hover:bg-cyan-500"
              }`}
            >
              {isDripping ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isDripping ? "Tạm dừng nhỏ giọt" : "Mở van Buret"}
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Làm lại
          </button>
        </div>
      </div>

      {/* Main 2.5D Bench & Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 2.5D Bench Stage */}
        <div className="lg:col-span-2 relative aspect-[16/9] min-h-[320px] w-full overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4">
          {/* Isometric Lab Bench Surface */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-800/80 to-slate-900/40 border-t border-slate-700/50 shadow-inner" />

          {/* Burette Visualization */}
          {buretteEq && (
            <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center z-10">
              <div className="relative w-8 h-44 rounded-t-sm border-2 border-slate-400/60 bg-white/10 backdrop-blur-sm overflow-hidden flex flex-col justify-end shadow-lg">
                {/* Graduated Markings */}
                <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-40 pointer-events-none">
                  {[0, 10, 20, 30, 40, 50].map((v) => (
                    <div key={v} className="flex justify-between items-center text-[7px] text-white">
                      <span>-</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
                {/* Liquid Level */}
                <div
                  className="w-full bg-cyan-400/30 transition-all duration-300 border-t-2 border-cyan-200"
                  style={{
                    height: `${Math.max(0, 100 - (dispensedMl / (buretteEq.capacityMl || 50)) * 100)}%`,
                  }}
                />
              </div>

              {/* Stopcock Valve */}
              <div className="w-10 h-3 bg-slate-700 rounded-sm border border-slate-500 my-0.5 flex items-center justify-center cursor-pointer hover:bg-slate-600">
                <div className={`w-6 h-1 bg-amber-400 rounded-full transition-transform ${isDripping ? "rotate-90" : ""}`} />
              </div>

              {/* Liquid Drip Particle Animation */}
              {isDripping && (
                <div className="w-1.5 h-3 bg-cyan-300 rounded-full animate-bounce my-1" />
              )}
            </div>
          )}

          {/* Erlenmeyer Flask Visualization */}
          {flaskEq && flaskState && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex flex-col items-center z-10">
              {/* Flask Glass Body */}
              <div
                className="relative w-32 h-36 border-2 border-slate-300/60 bg-white/5 backdrop-blur-md rounded-b-3xl overflow-hidden shadow-2xl flex flex-col justify-end"
                style={{ clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)" }}
              >
                {/* Solution Liquid */}
                <div
                  className="w-full transition-all duration-500 border-t-2 border-white/50"
                  style={{
                    height: `${Math.min(85, (flaskState.totalVolumeMl / (flaskEq.capacityMl || 250)) * 100)}%`,
                    backgroundColor: flaskState.colorRgba,
                  }}
                />
              </div>

              {/* Vessel Label & Real-time Readouts */}
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-900/90 border border-slate-800 px-3 py-1 text-[11px] font-mono text-slate-200">
                <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                <span>pH: <strong className="text-cyan-300">{flaskState.ph.toFixed(2)}</strong></span>
                <span>|</span>
                <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                <span>{flaskState.temperatureC.toFixed(1)}°C</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Real-time Titration Curve & Gauges */}
        <div className="flex flex-col gap-3">
          <TitrationCurveWidget data={titrationHistory} equivalenceVolMl={25.0} />

          {/* Real-time Chemical State Summary */}
          {flaskState && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Droplet className="h-4 w-4 text-cyan-400" />
                Trạng thái Dung dịch trong bình
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Thể tích: <strong className="text-white">{flaskState.totalVolumeMl.toFixed(2)} mL</strong></div>
                <div>Đã nhỏ: <strong className="text-cyan-300">{dispensedMl.toFixed(2)} mL</strong></div>
                <div>pH Hiện tại: <strong className="text-amber-300">{flaskState.ph.toFixed(2)}</strong></div>
                <div>Nhiệt độ: <strong className="text-rose-300">{flaskState.temperatureC.toFixed(1)}°C</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
