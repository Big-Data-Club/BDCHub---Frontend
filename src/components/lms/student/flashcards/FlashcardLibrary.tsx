"use client";
import { useState } from "react";
import { Layers, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFlashcardLibrary } from "@/hooks/lms/student/useFlashcardLibrary";
import { CardEditor } from "./CardEditor";
import { GenerateCards } from "./GenerateCards";
import { ReviewSession } from "./ReviewSession";
import { button, input, panel, primary } from "./styles";

export function FlashcardLibrary({ courseId, courses, onCourse }: { courseId: number; courses: { id: number; title: string }[]; onCourse: (id: number) => void }) {
  const f = useFlashcardLibrary(courseId);
  const [generating, setGenerating] = useState(false);
  const [deckForm, setDeckForm] = useState<{ id?: number; name: string } | null>(null);
  const [deletion, setDeletion] = useState<{ kind: "card" | "deck"; id: number; name: string } | null>(null);
  const selected = f.library.decks.find(d => d.id === f.selectedDeck);
  const hasEditor = f.drafts.length > 0;
  const openEditor = () => { setGenerating(false); f.edit(); };
  return <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-bold sm:text-3xl">Flashcard</h1>{!f.session && <div className="flex flex-wrap gap-2"><button className={button} disabled={f.busy || hasEditor} onClick={() => setGenerating(v => !v)}><Sparkles size={17} />Tạo bằng AI</button><button className={primary} disabled={f.busy || hasEditor} onClick={openEditor}><Plus size={17} />Tạo thẻ</button></div>}</header>
    <label className="block max-w-lg space-y-2 text-sm font-medium"><span>Khóa học</span><select className={input} value={courseId} disabled={f.busy || hasEditor || !!f.session} onChange={e => onCourse(Number(e.target.value))}>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
    {f.error && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">{f.error}<button className={button} onClick={f.reload} disabled={f.busy}>Tải lại</button></div>}
    {f.session ? <ReviewSession courseId={courseId} cards={f.session} onClose={f.finishReview} /> : <>
      {generating && !hasEditor && <GenerateCards busy={f.busy} onGenerate={f.generate} onCancel={() => setGenerating(false)} />}
      {hasEditor && <CardEditor drafts={f.drafts} onChange={f.setDrafts} decks={f.library.decks} deck={f.editorDeck} onDeck={f.setEditorDeck} busy={f.busy} onSave={() => { setGenerating(false); void f.save(); }} onCancel={() => { f.setDrafts([]); setGenerating(false); }} />}
      {!!f.library.unassigned_decks.length && <div className={`${panel} space-y-3`}><h2 className="font-semibold">Thẻ chưa chọn khóa học</h2>{f.library.unassigned_decks.map(deck => <div key={deck.id} className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm">{deck.name} · {deck.count} thẻ</span><button className={button} disabled={f.busy} onClick={() => void f.assignDeck(deck.id)}>Đưa vào khóa học này</button></div>)}</div>}
      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className={`${panel} !p-3`} aria-label="Bộ thẻ">
          <button onClick={() => f.setSelectedDeck(null)} aria-pressed={!f.selectedDeck} className={`${button} mb-2 w-full !justify-between ${!f.selectedDeck ? "!border-blue-500 !text-blue-600 dark:!text-cyan-400" : ""}`}><span>Tất cả thẻ</span><span>{f.library.cards.length}</span></button>
          <div className="max-h-80 space-y-1 overflow-y-auto">{f.library.decks.map(deck => <button key={deck.id} aria-pressed={f.selectedDeck === deck.id} onClick={() => f.setSelectedDeck(deck.id)} className={`${button} w-full !justify-between !border-transparent ${f.selectedDeck === deck.id ? "!bg-blue-50 !text-blue-700 dark:!bg-blue-950/30 dark:!text-cyan-400" : ""}`}><span className="truncate">{deck.name}</span><span className="ml-2 text-xs">{f.library.cards.filter(c => c.deck_id === deck.id).length}</span></button>)}</div>
          <button className={`${button} mt-3 w-full !border-dashed`} disabled={f.busy} onClick={() => setDeckForm({ name: "" })}><Plus size={16} />Bộ thẻ mới</button>
        </aside>
        <section className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><h2 className="truncate text-lg font-bold">{selected?.name ?? "Tất cả thẻ"}</h2>{selected && <><button className={button} aria-label="Đổi tên bộ thẻ" disabled={f.busy} onClick={() => setDeckForm({ id: selected.id, name: selected.name })}><Pencil size={15} /></button><button className={button} aria-label="Xóa bộ thẻ" disabled={f.busy} onClick={() => setDeletion({ kind: "deck", id: selected.id, name: selected.name })}><Trash2 size={15} /></button></>}</div>
            <div className="flex flex-wrap gap-2"><button className={button} disabled={!f.cards.length || f.busy || hasEditor} onClick={() => f.setSession([...f.cards])}>Ôn tất cả</button><button className={primary} disabled={!f.due.length || f.busy || hasEditor} onClick={() => f.setSession([...f.due].sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at)))}>Ôn đến hạn ({f.due.length})</button></div>
          </div>
          <label className="relative block"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className={`${input} !pl-10`} aria-label="Tìm thẻ" placeholder="Tìm thẻ…" value={f.query} onChange={e => f.setQuery(e.target.value)} /></label>
          {f.loading ? <div role="status" className={`${panel} text-center`}>Đang tải thẻ…</div> : !f.cards.length ? <div className={`${panel} space-y-4 py-12 text-center`}><Layers size={36} className="mx-auto text-slate-400 dark:text-slate-500" /><h3 className="text-lg font-semibold">{f.query ? "Không tìm thấy thẻ" : "Bộ thẻ của bạn đang trống"}</h3>{!f.query && <button className={primary} disabled={f.busy || hasEditor} onClick={openEditor}>Tạo thẻ đầu tiên</button>}</div> : <div className="grid gap-4 xl:grid-cols-2">{f.cards.map(card => <article key={card.id} className={`${panel} flex flex-col gap-4`}>
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400"><span className="truncate">{f.library.decks.find(d => d.id === card.deck_id)?.name}</span><span className="shrink-0">{Date.parse(card.due_at) <= Date.now() ? "Đến hạn ôn" : `Ôn lại ${new Date(card.due_at).toLocaleDateString("vi-VN")}`}</span></div>
            <p className="whitespace-pre-wrap break-words font-semibold">{card.front_text}</p><p className="whitespace-pre-wrap break-words border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-blue-500/10 dark:text-slate-300">{card.back_text}</p>
            <div className="mt-auto flex items-center justify-between gap-2"><span className="text-xs text-slate-500 dark:text-slate-400">{card.match_mode === "ai" ? "Kiểm tra ý nghĩa" : "Khớp đáp án"}</span><div className="flex gap-2"><button className={button} aria-label={`Sửa thẻ ${card.front_text}`} disabled={f.busy || hasEditor} onClick={() => { setGenerating(false); f.edit(card); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil size={15} /></button><button className={button} aria-label={`Xóa thẻ ${card.front_text}`} disabled={f.busy || hasEditor} onClick={() => setDeletion({ kind: "card", id: card.id, name: card.front_text })}><Trash2 size={15} /></button></div></div>
          </article>)}</div>}
        </section>
      </div>
    </>}
    <Dialog open={!!deckForm} onOpenChange={open => { if (!open && !f.busy) setDeckForm(null); }}><DialogContent aria-describedby={undefined}><DialogHeader><DialogTitle>{deckForm?.id ? "Đổi tên bộ thẻ" : "Bộ thẻ mới"}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={async e => { e.preventDefault(); if (!deckForm) return; if (deckForm.id) await f.renameDeck(deckForm.id, deckForm.name); else await f.createDeck(deckForm.name); setDeckForm(null); }}><label className="block space-y-2 text-sm"><span>Tên bộ thẻ</span><input autoFocus required maxLength={120} className={input} value={deckForm?.name ?? ""} onChange={e => setDeckForm(v => v ? { ...v, name: e.target.value } : v)} /></label><button className={primary} disabled={f.busy || !deckForm?.name.trim()}>Lưu</button></form></DialogContent></Dialog>
    <Dialog open={!!deletion} onOpenChange={open => { if (!open && !f.busy) setDeletion(null); }}><DialogContent aria-describedby={undefined}><DialogHeader><DialogTitle>{deletion?.kind === "deck" ? "Xóa bộ thẻ và các thẻ bên trong?" : "Xóa thẻ này?"}</DialogTitle></DialogHeader><p className="line-clamp-3 break-words text-sm">{deletion?.name}</p><div className="flex justify-end gap-2"><button className={button} disabled={f.busy} onClick={() => setDeletion(null)}>Giữ lại</button><button className={`${primary} !border-red-600 !bg-red-600`} disabled={f.busy} onClick={async () => { if (!deletion) return; if (deletion.kind === "deck") await f.deleteDeck(deletion.id); else await f.deleteCard(deletion.id); setDeletion(null); }}>Xóa</button></div></DialogContent></Dialog>
  </div>;
}
