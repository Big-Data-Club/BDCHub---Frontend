"use client";
import { Sprout, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFarm } from "../hooks/useFarm";
import { FarmWorld, Pixel, plotStatus } from "./FarmWorld";
import { SpeciesGuide } from "./SpeciesGuide";
import { HarvestDialog } from "./HarvestDialog";
import type { LearningMode } from "../types";

export default function KnowledgeFarm() {
  const farm = useFarm();
  const { view, plot, now } = farm;
  const species = view?.catalog.find(c => c.kind === plot?.kind);
  const ready = !!plot?.ready_at && Date.parse(plot.ready_at) <= now;
  const resting = !!plot && Date.parse(plot.rest_until) > now;
  const retrying = !!plot && Date.parse(plot.retry_at) > now;
  return <div className="mx-auto max-w-7xl space-y-6 text-slate-900 dark:text-slate-100">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300"><Sprout size={18} /> Gieo tò mò, gặt hiểu biết</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Nông trại kiến thức</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">Chăm cây, nuôi vật, học thêm điều hay. Mỗi lần thu hoạch là một câu quiz hoặc flashcard.</p></div>
      <Button variant="outline" onClick={() => void farm.reload()} disabled={farm.busy}><RefreshCw size={16} className="mr-2" /> Làm mới</Button>
    </header>
    {farm.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{farm.error}</p>}
    {!view && !farm.error && <p role="status" className="py-16 text-center text-slate-500">Đang mở cổng nông trại…</p>}
    {view && <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Điểm học từ nông trại" value={view.state.earned} />
        <Stat label="Điểm hôm nay · đặt lại lúc 07:00 (giờ Việt Nam)" value={`${view.state.daily_earned} / ${view.daily_limit}`} />
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900"><p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Trophy size={15} /> Tổng điểm tài khoản</p><p className="mt-2 text-2xl font-semibold tabular-nums">{farm.score ?? "—"}</p><p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{farm.score === null ? "Chưa đọc được tổng điểm. Nông trại vẫn chơi được." : "Tự cập nhật mỗi 15 giây."} {view.pending_events > 0 ? `${view.pending_events} lượt đang chờ gửi.` : "Điểm mới xuất hiện sau khi được xử lý."}</p></div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4"><FarmWorld plots={view.state.plots} catalog={view.catalog} selected={farm.selected} onSelect={id => { if (farm.busy) return; farm.setSelected(id); farm.setResult(null); }} now={now} />
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Chăm sóc → chờ lớn → trả lời → thu hoạch. Mỗi câu đúng nhận {view.reward} điểm, tối đa {view.daily_limit} điểm/ngày. Đạt giới hạn vẫn có thể chơi và học tiếp. Sau mỗi lượt, ô nghỉ 40 giây rồi có thể chăm lại.</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Game mô phỏng dành cho học tập. Không có giao dịch hay kết nối nông trại ngoài đời.</p>
        </div>
        {plot && species && <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><Pixel kind={species.kind} size={56} /><div><h2 className="text-lg font-semibold">{species.label}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{plotStatus(plot, now)} · Sản phẩm: {species.product}</p></div></div>
          {farm.result && <div role="status" className="space-y-1 rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800"><p className="font-semibold">{farm.result.correct ? `Thu hoạch thành công! +${farm.result.awarded} điểm` : "Chưa đúng, cùng tìm hiểu lại nhé."}</p><p>{farm.result.explanation}</p>{farm.result.correct && farm.result.awarded === 0 && <p>Bạn đã nhận đủ điểm hôm nay, lượt học vẫn được ghi nhận.</p>}</div>}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Cách học khi thu hoạch
              <select value={farm.mode} onChange={e => farm.setMode(e.target.value as LearningMode)} disabled={farm.busy}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900">
                <option value="quiz">Quiz · chọn đáp án</option><option value="flashcard">Flashcard · nhớ và nhập đáp án</option>
              </select>
            </label>
            {ready ? <Button className="w-full" disabled={farm.busy || retrying} onClick={() => void farm.start()}>{farm.busy ? "Đang mở…" : "Trả lời để thu hoạch"}</Button> :
              <Button className="w-full" disabled={farm.busy || resting || !!plot.ready_at} onClick={() => void farm.care()}>{species.care}</Button>}
            <p className="text-xs text-slate-500 dark:text-slate-400">Một lượt lớn trong game: {species.seconds} giây. Chăm sóc không tốn điểm.</p>
          </div>
          <SpeciesGuide species={species} />
        </aside>}
      </div>
    </>}
    {plot?.challenge && <HarvestDialog key={plot.challenge.id} challenge={plot.challenge} open={farm.challengeOpen}
      onClose={() => farm.setChallengeOpen(false)} onAnswer={answer => void farm.answer(answer)} busy={farm.busy} error={farm.error} now={now} />}
  </div>;
}
function Stat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div>;
}
