"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flashcardLibraryService } from "@/services/lms/flashcardLibraryService";
import type { CardDraft, FlashcardLibrary, PersonalCard } from "@/types/lms/flashcardLibrary";

export const emptyCard = (): CardDraft => ({ front_text: "", back_text: "", accepted_answers: [], note: "", language: "vi-VN", answer_language: "vi-VN", match_mode: "exact", case_sensitive: false });
export function useFlashcardLibrary(courseId: number) {
  const service = useMemo(() => flashcardLibraryService(courseId), [courseId]);
  const [library, setLibrary] = useState<FlashcardLibrary>({ decks: [], cards: [], unassigned_decks: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<CardDraft[]>([]);
  const [editorDeck, setEditorDeck] = useState<number | null>(null);
  const [session, setSession] = useState<PersonalCard[] | null>(null);
  const controller = useRef<AbortController | null>(null);
  const lock = useRef(false);

  const reload = useCallback(async (signal?: AbortSignal) => { setLibrary(await service.list(signal)); }, [service]);
  useEffect(() => {
    const abort = new AbortController();
    void reload(abort.signal).catch(e => { if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "Chưa tải được thẻ. Hãy thử lại."); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => { abort.abort(); controller.current?.abort(); };
  }, [reload]);
  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await work(); } catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setError(e instanceof Error ? e.message : "Chưa lưu được. Hãy thử lại."); }
    finally { lock.current = false; setBusy(false); }
  };
  const cards = useMemo(() => library.cards.filter(c => (!selectedDeck || c.deck_id === selectedDeck) && `${c.front_text} ${c.back_text} ${c.note}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [library.cards, selectedDeck, query]);
  const due = cards.filter(c => Date.parse(c.due_at) <= Date.now());
  return {
    library, loading, busy, error, selectedDeck, setSelectedDeck, query, setQuery, cards, due,
    drafts, setDrafts, editorDeck, setEditorDeck, session, setSession: (cards: PersonalCard[]) => { setSession(cards); window.scrollTo({ top: 0 }); },
    reload: () => run(async () => { await reload(); setLoading(false); }),
    createDeck: (name: string) => run(async () => { const deck = await service.createDeck(name); await reload(); setSelectedDeck(deck.id); setEditorDeck(deck.id); }),
    renameDeck: (id: number, name: string) => run(async () => { await service.renameDeck(id, name); await reload(); }),
    assignDeck: (id: number) => run(async () => { await service.assignDeck(id); await reload(); }),
    deleteDeck: (id: number) => run(async () => { await service.deleteDeck(id); setSelectedDeck(null); setDrafts([]); await reload(); }),
    deleteCard: (id: number) => run(async () => { await service.deleteCard(id); await reload(); }),
    edit: (card?: PersonalCard) => { setDrafts([card ? { ...card } : emptyCard()]); setEditorDeck(card?.deck_id ?? selectedDeck ?? library.decks[0]?.id ?? null); },
    save: () => run(async () => {
      let deckID = editorDeck;
      if (!deckID) { const deck = await service.createDeck("Bộ thẻ của tôi"); deckID = deck.id; setEditorDeck(deckID); }
      await service.save(deckID, drafts.map(card => ({ ...card, accepted_answers: card.accepted_answers.map(a => a.trim()).filter(Boolean) }))); setDrafts([]); await reload();
    }),
    generate: (topic: string, count: number, language: string, answerLanguage: string) => run(async () => {
      controller.current?.abort(); controller.current = new AbortController();
      const result = await service.generate(topic, count, language, answerLanguage, controller.current.signal);
      setDrafts(result.cards); setEditorDeck(selectedDeck ?? library.decks[0]?.id ?? null);
    }),
    finishReview: () => { setSession(null); void run(() => reload()); },
  };
}
