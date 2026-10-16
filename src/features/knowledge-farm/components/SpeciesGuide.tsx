import { BookOpen, ExternalLink } from "lucide-react";
import type { Species } from "../types";

export function SpeciesGuide({ species }: { species: Species }) {
  return <section className="space-y-4 border-t border-slate-200 pt-5 text-sm dark:border-slate-700" aria-label={`Tìm hiểu ${species.label}`}>
    <h3 className="flex items-center gap-2 font-semibold"><BookOpen size={18} /> Ngoài đời thực</h3>
    <div><h4 className="mb-1 font-medium">Môi trường phù hợp</h4><p className="leading-relaxed text-slate-600 dark:text-slate-300">{species.environment}</p></div>
    <div><h4 className="mb-2 font-medium">{species.category === "crop" ? "Quy trình trồng cơ bản" : "Quy trình chăm sóc cơ bản"}</h4>
      <ol className="list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-300">{species.steps.map(step => <li key={step}>{step}</li>)}</ol>
    </div>
    <p className="rounded-lg bg-emerald-50 p-3 leading-relaxed text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">{species.fact}</p>
    <a href={species.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700 underline underline-offset-4 dark:text-blue-300">{species.source_title} <ExternalLink size={12} /></a>
    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Kiến thức nhập môn. Điều kiện thực tế thay đổi theo giống, mùa vụ và địa phương. Hình ảnh và bộ đếm trong game là mô phỏng.</p>
  </section>;
}
