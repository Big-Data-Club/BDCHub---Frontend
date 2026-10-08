import { isAxiosError } from "axios";
import { lmsApiClient } from "./lmsApiClient";
import type { AnswerResult, CardDraft, FlashcardJob, FlashcardLibrary } from "@/types/lms/flashcardLibrary";

async function action<T>(courseId: number, name: string, data: object = {}, signal?: AbortSignal): Promise<T> {
  try {
    const response = await lmsApiClient.post<{ data: T }>(`/courses/${courseId}/flashcard-library`, { action: name, data }, { signal });
    return response.data.data;
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (isAxiosError(error)) {
      if (error.response?.status === 404 && !error.response?.data?.message) throw new Error("Kho thẻ chưa sẵn sàng. Hãy thử lại sau ít phút.");
      throw new Error(error.response?.data?.message || "Chưa kết nối được. Hãy thử lại.");
    }
    throw error;
  }
}
async function waitForJob<T>(courseId: number, job: FlashcardJob<T>, signal: AbortSignal): Promise<T> {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    signal.throwIfAborted();
    const status = await action<FlashcardJob<T>>(courseId, "job", { job_id: job.job_id }, signal);
    if (status.status === "completed" && status.result) return status.result;
    if (status.status === "failed") throw new Error(status.error || "Chưa xử lý được. Hãy thử lại.");
    await new Promise<void>((resolve, reject) => {
      const cancel = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
      const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, 1500);
      signal.addEventListener("abort", cancel, { once: true });
    });
  }
  throw new Error("Yêu cầu mất nhiều thời gian hơn dự kiến. Hãy thử lại.");
}
export const flashcardLibraryService = (courseId: number) => ({
  list: (signal?: AbortSignal) => action<FlashcardLibrary>(courseId, "list", {}, signal),
  createDeck: (name: string) => action<{ id: number; name: string }>(courseId, "create_deck", { name }),
  renameDeck: (deck_id: number, name: string) => action(courseId, "rename_deck", { deck_id, name }),
  assignDeck: (deck_id: number) => action(courseId, "assign_deck", { deck_id }),
  deleteDeck: (deck_id: number) => action(courseId, "delete_deck", { deck_id }),
  save: (deck_id: number, cards: CardDraft[]) => action(courseId, "save_cards", { deck_id, cards }),
  deleteCard: (card_id: number) => action(courseId, "delete_card", { card_id }),
  async generate(topic: string, count: number, language: string, answer_language: string, signal: AbortSignal) {
    const job = await action<FlashcardJob<{ cards: CardDraft[] }>>(courseId, "generate", { topic, count, language, answer_language }, signal);
    return waitForJob(courseId, job, signal);
  },
  async fromContent<T>(kind: "generate_content" | "quiz_content", data: { content_id?: number; lesson_id?: number; request_id: string; count: number; language: string }, signal: AbortSignal): Promise<T> {
    const job = await action<FlashcardJob<T>>(courseId, kind, data, signal);
    return waitForJob(courseId, job, signal);
  },
  async check(card_id: number, answer: string, review_id: string, revision: number, signal: AbortSignal, reveal = false) {
    const result = await action<AnswerResult | FlashcardJob<AnswerResult>>(courseId, "check", { card_id, answer, review_id, revision, reveal }, signal);
    return "job_id" in result ? waitForJob(courseId, result, signal) : result;
  },
});
