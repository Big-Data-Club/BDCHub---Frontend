import type { AnswerResult, FarmView, LearningMode } from "./types";
async function request<T>(path = "", body?: object): Promise<T> {
  const response = await fetch(`/api/farm${path}`, {
    method: body ? "POST" : "GET", credentials: "same-origin", cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Không thể cập nhật nông trại.");
  return data as T;
}
export const farmAPI = {
  score: () => request<{ total_score: number }>("/score"),
  load: () => request<FarmView>(),
  care: (plot: number) => request<FarmView>(`/plots/${plot}/care`, {}),
  start: (plot: number, kind: LearningMode) => request<FarmView>(`/plots/${plot}/challenge`, { kind }),
  answer: (plot: number, challenge_id: string, answer: string) =>
    request<AnswerResult>(`/plots/${plot}/answer`, { challenge_id, answer }),
};
