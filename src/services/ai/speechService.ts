interface SpeechJob {
  job_id: string;
  status: "queued" | "running" | "ready" | "failed";
  error?: string;
}
async function request<T>(path: string, signal: AbortSignal, body?: object): Promise<T> {
  const response = await fetch(`/api/ai/speech/${path}`, {
    method: body ? "POST" : "GET", signal,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(typeof data.detail === "string" ? data.detail : data.error || "Giọng neural chưa sẵn sàng.");
  }
  return response.json() as Promise<T>;
}
export const speechService = {
  async flashcard(courseId: number, cardId: number, side: "front" | "back", speed: number, signal: AbortSignal): Promise<Blob> {
    let job = await request<SpeechJob>("flashcard", signal, { course_id: courseId, card_id: cardId, side, speed });
    const deadline = Date.now() + 600_000;
    while (job.status !== "ready") {
      signal.throwIfAborted();
      if (job.status === "failed") throw new Error(job.error || "Không tạo được giọng đọc.");
      if (Date.now() > deadline) throw new Error("Giọng đọc đang xử lý lâu. Hãy thử lại sau.");
      await new Promise<void>((resolve, reject) => {
        const cancel = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
        const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, 1500);
        signal.addEventListener("abort", cancel, { once: true });
      });
      job = await request<SpeechJob>(`jobs/${job.job_id}`, signal);
    }
    const response = await fetch(`/api/ai/speech/jobs/${job.job_id}/audio`, { signal, cache: "no-store" });
    if (!response.ok) throw new Error("Không tải được giọng đọc.");
    return response.blob();
  },
};
