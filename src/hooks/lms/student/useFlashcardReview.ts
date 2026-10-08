"use client";
import { useEffect, useRef, useState } from "react";
import { flashcardLibraryService } from "@/services/lms/flashcardLibraryService";
import type { AnswerResult, PersonalCard } from "@/types/lms/flashcardLibrary";

export function useFlashcardReview(courseId: number, cards: PersonalCard[]) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [correct, setCorrect] = useState(0);
  const request = useRef<AbortController | null>(null);
  const attempt = useRef<{ id: string; answer: string } | null>(null);
  const lock = useRef(false);
  useEffect(() => () => request.current?.abort(), []);
  const card = cards[index];
  const check = async () => {
    if (!card || !answer.trim() || lock.current || result) return;
    lock.current = true; setBusy(true); setError("");
    // A retry keeps the same answer and key, so a lost response cannot count twice.
    if (!attempt.current) attempt.current = { id: crypto.randomUUID(), answer };
    request.current = new AbortController();
    try {
      const checked = await flashcardLibraryService(courseId).check(card.id, attempt.current.answer, attempt.current.id, card.revision, request.current.signal);
      setResult(checked); if (checked.correct) setCorrect(c => c + 1);
    } catch (e) { if (!request.current.signal.aborted) setError(e instanceof Error ? e.message : "Chưa kiểm tra được. Hãy thử lại."); }
    finally { lock.current = false; setBusy(false); }
  };
  const next = () => { setIndex(i => i + 1); setAnswer(""); setResult(null); setError(""); attempt.current = null; };
  return { card, index, answer, setAnswer, result, busy, error, correct, check, next, locked: !!attempt.current };
}
