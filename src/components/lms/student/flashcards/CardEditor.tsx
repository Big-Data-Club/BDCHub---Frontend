"use client";
import { Plus, Trash2, Layers, Save, X } from "lucide-react";
import type { CardDraft, FlashcardLibrary } from "@/types/lms/flashcardLibrary";
import { emptyCard } from "@/hooks/lms/student/useFlashcardLibrary";
import { button, input, languages, panel, primary } from "./styles";

interface Props {
  drafts: CardDraft[]; onChange: (cards: CardDraft[]) => void;
  decks: FlashcardLibrary["decks"]; deck: number | null; onDeck: (id: number | null) => void;
  busy: boolean; onSave: () => void; onCancel: () => void;
}
export function CardEditor({ drafts, onChange, decks, deck, onDeck, busy, onSave, onCancel }: Props) {
  const update = (index: number, patch: Partial<CardDraft>) => onChange(drafts.map((card, i) => i === index ? { ...card, ...patch } : card));
  return <form className={`${panel} space-y-6 !p-0 overflow-hidden`} onSubmit={e => { e.preventDefault(); onSave(); }}>
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-blue-500/10 dark:bg-[#0D192E]/60 sm:px-6">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"><Layers size={21} /></span><h2 className="text-lg font-bold">{drafts[0]?.id ? "Sửa thẻ" : "Tạo thẻ"}</h2><span className="rounded-full bg-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">{drafts.length}</span></div>
      <button type="button" className={button} aria-label="Đóng trình tạo thẻ" onClick={onCancel} disabled={busy}><X size={16} /></button>
    </div>
    <label className="mx-5 block space-y-2 text-sm font-medium sm:mx-6"><span>Bộ thẻ</span><select className={input} value={deck ?? ""} onChange={e => onDeck(e.target.value ? Number(e.target.value) : null)} disabled={busy}>
      <option value="">Bộ thẻ của tôi (mới)</option>{decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select></label>
    <fieldset disabled={busy} className="space-y-5 px-5 sm:px-6">
      {drafts.map((card, index) => <div key={card.id ?? index} className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-blue-500/15 sm:p-5">
        <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Thẻ {index + 1}</span>{drafts.length > 1 && <button type="button" className={button} aria-label={`Bỏ thẻ ${index + 1}`} onClick={() => onChange(drafts.filter((_, i) => i !== index))}><Trash2 size={16} /></button>}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm font-medium dark:bg-[#0D192E]"><span className="text-slate-500 dark:text-slate-400">Mặt trước</span><textarea required maxLength={4000} rows={4} className={`${input} resize-y !border-transparent !bg-transparent !px-0 !text-base focus:!border-blue-500/30 focus:!px-3`} value={card.front_text} onChange={e => update(index, { front_text: e.target.value })} placeholder="Từ, câu hỏi hoặc khái niệm" /></label>
          <label className="space-y-3 rounded-xl bg-blue-50/60 p-4 text-sm font-medium dark:bg-blue-500/5"><span className="text-blue-600 dark:text-blue-400">Đáp án</span><textarea required maxLength={4000} rows={4} className={`${input} resize-y !border-transparent !bg-transparent !px-0 !text-base focus:!border-blue-500/30 focus:!px-3`} value={card.back_text} onChange={e => update(index, { back_text: e.target.value })} placeholder="Điều bạn muốn ghi nhớ" /></label>
        </div>
        <details className="border-t border-slate-100 pt-4 dark:border-blue-500/10">
          <summary className="cursor-pointer text-sm font-semibold">Tùy chỉnh</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm"><span>Cách kiểm tra</span><select className={input} value={card.match_mode} onChange={e => update(index, { match_mode: e.target.value as CardDraft["match_mode"] })}><option value="exact">Khớp đáp án</option><option value="ai">AI kiểm tra ý nghĩa</option></select></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={card.case_sensitive} onChange={e => update(index, { case_sensitive: e.target.checked })} />Phân biệt chữ hoa, chữ thường</label>
            <label className="space-y-2 text-sm sm:col-span-2"><span>Đáp án khác được chấp nhận (mỗi dòng một đáp án)</span><textarea rows={2} className={input} value={card.accepted_answers.join("\n")} onChange={e => update(index, { accepted_answers: e.target.value.split("\n") })} /></label>
            <label className="space-y-2 text-sm sm:col-span-2"><span>Ghi chú</span><textarea maxLength={4000} rows={2} className={input} value={card.note} onChange={e => update(index, { note: e.target.value })} /></label>
            {(["language", "answer_language"] as const).map((key, i) => <label key={key} className="space-y-2 text-sm"><span>{i === 0 ? "Ngôn ngữ mặt trước" : "Ngôn ngữ đáp án"}</span><select className={input} value={card[key]} onChange={e => update(index, { [key]: e.target.value })}>{languages.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>)}
          </div>
        </details>
      </div>)}
    </fieldset>
    <div className="sticky bottom-0 flex flex-wrap justify-between gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-blue-500/15 dark:bg-[#0F1E35]/95 sm:px-6"><button type="button" className={button} disabled={busy || drafts.length >= 100} onClick={() => onChange([...drafts, emptyCard()])}><Plus size={16} />Thêm thẻ</button><button className={primary} disabled={busy || drafts.some(c => !c.front_text.trim() || !c.back_text.trim())}><Save size={16} />{busy ? "Đang lưu…" : `Lưu ${drafts.length} thẻ`}</button></div>
  </form>;
}
