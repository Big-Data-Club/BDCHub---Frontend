import Image from "next/image";
import type { Plot, Species } from "../types";

// Adapted from XanhMarket PlayerView's Pix + selected entity interaction.
export function Pixel({ kind, size = 64 }: { kind: string; size?: number }) {
  return (
    <Image
      src={`/knowledge-farm/sprites/${kind}.png`}
      width={size}
      height={size}
      className="object-contain [image-rendering:pixelated]"
      alt=""
      unoptimized
    />
  );
}
export function plotStatus(plot: Plot, now: number) {
  if (Date.parse(plot.rest_until) > now)
    return `Nghỉ ${Math.ceil((Date.parse(plot.rest_until) - now) / 1000)}s`;
  if (!plot.ready_at) return "Cần chăm sóc";
  if (Date.parse(plot.ready_at) > now)
    return `Đang lớn · ${Math.ceil((Date.parse(plot.ready_at) - now) / 1000)}s`;
  if (Date.parse(plot.retry_at) > now)
    return `Thử lại sau ${Math.ceil((Date.parse(plot.retry_at) - now) / 1000)}s`;
  return "Sẵn sàng thu hoạch";
}
export function FarmWorld({
  plots,
  catalog,
  selected,
  onSelect,
  now,
}: {
  plots: Plot[];
  catalog: Species[];
  selected: number;
  onSelect: (id: number) => void;
  now: number;
}) {
  return (
    <section
      aria-label="Khu vườn của bạn"
      className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-emerald-200 bg-white/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="text-sm font-semibold">
            Một góc xanh, mỗi ngày một điều mới
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Chọn một ô để chăm sóc hoặc tìm hiểu.
          </p>
        </div>
        <Pixel kind="farmer" size={44} />
      </div>
      <div
        className="relative p-4 sm:p-7"
        style={{
          backgroundImage: "url('/knowledge-farm/sprites/grass.png')",
          backgroundSize: "64px",
        }}
      >
        <div className="mb-4 flex items-end justify-between" aria-hidden="true">
          <Pixel kind="house" size={76} />
          <div className="flex">
            <Pixel kind="fence" />
            <Pixel kind="fence" />
            <Pixel kind="fence" />
          </div>
          <Pixel kind="hive" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {plots.map((plot) => {
            const species = catalog.find((c) => c.kind === plot.kind)!;
            const ready = plot.ready_at && Date.parse(plot.ready_at) <= now;
            return (
              <button
                key={plot.id}
                type="button"
                aria-pressed={selected === plot.id}
                onClick={() => onSelect(plot.id)}
                className={`group flex min-h-40 flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 text-slate-900 shadow-sm transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected === plot.id ? "border-emerald-800 bg-amber-50 ring-2 ring-white" : "border-amber-800/30 bg-amber-50/95 hover:border-emerald-700"}`}
              >
                <Pixel kind={plot.kind} size={64} />
                <span className="text-sm font-semibold">{species.label}</span>
                <span
                  className={`text-xs ${ready ? "font-semibold text-emerald-800" : "text-slate-600"}`}
                >
                  {plotStatus(plot, now)}
                </span>
                <span className="text-[11px] text-slate-600">
                  Đã thu hoạch {plot.harvests} lần
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
