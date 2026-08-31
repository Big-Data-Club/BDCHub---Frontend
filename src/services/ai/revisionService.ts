export type RevisionKind = "lesson" | "question" | "quiz" | "slide_section";

export async function previewAIRevision<T extends Record<string, unknown>>(
  kind: RevisionKind,
  instruction: string,
  source: T,
): Promise<T> {
  const response = await fetch("/api/ai/revisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, instruction, source }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.detail || data?.error || "Không thể tạo bản đề xuất AI.");
  return data.proposal as T;
}
