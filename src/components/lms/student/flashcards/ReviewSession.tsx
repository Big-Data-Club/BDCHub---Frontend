"use client";
import { useEffect, useRef } from "react";
import { Check, Volume2, X } from "lucide-react";
import { useFlashcardReview } from "@/hooks/lms/student/useFlashcardReview";
import { useFlashcardSpeech } from "@/hooks/lms/student/useFlashcardSpeech";
import type { PersonalCard } from "@/types/lms/flashcardLibrary";
import { button, input, panel, primary } from "./styles";
export function ReviewSession({ courseId, cards, onClose }: { courseId: number; cards: PersonalCard[]; onClose: () => void }) {
  const r = useFlashcardReview(courseId, cards);
  const speech = useFlashcardSpeech();
  const answerRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { answerRef.current?.focus(); }, [r.index]);
  const close = () => { speech.stop(); onClose(); };
  if (!r.card) return <div className={`${panel} mx-auto max-w-2xl space-y-6 text-center`}><Check className="mx-auto text-emerald-600 dark:text-emerald-400" size={36} /><h2 className="text-2xl font-bold">Xong lượt ôn!</h2><p>{r.correct}/{cards.length} câu trả lời đúng</p><button className={primary} onClick={close}>Về bộ thẻ</button></div>;
  return <div className="mx-auto max-w-3xl space-y-5">
    <div className="flex items-center justify-between"><span className="text-sm font-medium">{r.index + 1} / {cards.length}</span><button className={button} onClick={close}><X size={16} />Kết thúc</button></div>
    <progress aria-label="Tiến độ ôn" value={r.index + (r.result ? 1 : 0)} max={cards.length} className="h-1.5 w-full accent-blue-600" />
    <div className={`${panel} space-y-6`}>
      <div className="flex items-start justify-between gap-4"><h2 className="whitespace-pre-wrap break-words text-xl font-semibold leading-relaxed sm:text-2xl">{r.card.front_text}</h2><button className={button} aria-label="Đọc mặt trước" disabled={!speech.voices.length} onClick={() => speech.speak(r.card.front_text, r.card.language)}><Volume2 size={18} /></button></div>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); void r.check(); }}>
        <label className="block space-y-2 text-sm font-medium"><span>Câu trả lời của bạn</span><textarea ref={answerRef} className={input} rows={4} maxLength={4000} value={r.answer} disabled={r.busy || !!r.result || r.locked} onChange={e => r.setAnswer(e.target.value)} placeholder="Nhập câu trả lời…" /></label>
        {!r.result && <button className={primary} disabled={r.busy || (!r.answer.trim() && !r.locked)}>{r.busy ? "Đang kiểm tra…" : r.error ? "Thử lại" : "Kiểm tra"}</button>}
        {!r.result && !r.locked && <button type="button" className={`${button} ml-2`} disabled={r.busy} onClick={() => void r.check(true)}>Chưa nhớ</button>}
      </form>
      {r.error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{r.error}</p>}
      {r.result && <div role="status" className="space-y-4 border-t border-slate-200 pt-5 dark:border-blue-500/10">
        <p className={`font-semibold ${r.result.correct ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>{r.result.feedback}</p>
        <div className="flex items-start justify-between gap-4"><p className="whitespace-pre-wrap break-words">{r.result.back_text}</p><button className={button} aria-label="Đọc đáp án" disabled={!speech.voices.length} onClick={() => speech.speak(r.result!.back_text, r.card.answer_language)}><Volume2 size={18} /></button></div>
        {r.result.note && <p className="whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{r.result.note}</p>}
        <button className={primary} onClick={() => { speech.stop(); r.next(); }}>{r.index + 1 === cards.length ? "Hoàn thành" : "Thẻ tiếp theo"}</button>
      </div>}
    </div>
    <details className={panel}><summary className="cursor-pointer text-sm font-medium">Giọng đọc</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm"><span>Giọng</span><select className={input} value={speech.voiceURI} onChange={e => speech.setVoiceURI(e.target.value)}><option value="">Theo ngôn ngữ của thẻ</option>{speech.voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}</select></label>
      <label className="space-y-2 text-sm"><span>Tốc độ · {speech.rate}×</span><input className="w-full accent-blue-600" type="range" min={0.5} max={1.5} step={0.1} value={speech.rate} onChange={e => speech.setRate(Number(e.target.value))} /></label>
      {!speech.voices.length && <p className="text-sm text-slate-500 dark:text-slate-400">Trình duyệt chưa có giọng đọc khả dụng.</p>}
      {speech.speaking && <button className={button} onClick={speech.stop}>Dừng đọc</button>}
      {speech.error && <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">{speech.error}</p>}
    </div></details>
  </div>;
}
