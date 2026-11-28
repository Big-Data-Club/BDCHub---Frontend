import type { AgentMessage, AIReference } from "@/types";
import type { WorkspaceSource } from "../types";

export function mentorQuestions(messages: AgentMessage[]) {
  const questions = new Map<string, string>();
  let latest = "";
  for (const message of messages) {
    if (message.role === "user") latest = message.content;
    else if (latest) questions.set(message.id, latest);
  }
  return questions;
}

export function mentorNoteTitle(question: string | undefined, answer: string) {
  return (
    (question?.trim() || answer.replace(/^\s*#+\s+/gm, "").trim())
      .split(/\r?\n/, 1)[0]
      .replace(/\s+/g, " ")
      .slice(0, 300)
      .replace(/[\uD800-\uDBFF]$/, "")
      .trim() || "Ghi chú từ AI Mentor"
  );
}

export async function mentorNoteSources(
  references: AIReference[],
  resolveLesson: (id: number) => Promise<string | undefined>,
): Promise<WorkspaceSource[]> {
  const cited = references.slice(0, 30);
  const materialIds = [
    ...new Set(
      cited.flatMap(({ source_type, content_id }) =>
        source_type === "material" &&
        typeof content_id === "number" &&
        Number.isSafeInteger(content_id) &&
        content_id > 0
          ? [content_id]
          : [],
      ),
    ),
  ];
  const lessons = new Map<number, string | undefined>();
  for (let index = 0; index < materialIds.length; index += 4) {
    await Promise.all(
      materialIds.slice(index, index + 4).map(async (id) => {
        const url = await resolveLesson(id).catch(() => undefined);
        lessons.set(id, url);
      }),
    );
  }

  return cited.map((reference, index) => {
    const isMaterial = reference.source_type === "material";
    let url = isMaterial ? lessons.get(reference.content_id ?? 0) : undefined;
    if (!isMaterial && reference.url && reference.url.length <= 2000) {
      try {
        const parsed = new URL(reference.url);
        if (
          ["https:", "http:"].includes(parsed.protocol) &&
          !parsed.username &&
          !parsed.password
        )
          url = reference.url;
      } catch {}
    }
    const number = reference.citation_number ?? index + 1;
    const page =
      isMaterial && reference.page_number != null
        ? ` · tr. ${reference.page_number}`
        : "";
    const title =
      reference.title?.trim() ||
      (isMaterial ? "Tài liệu khóa học" : "Nguồn web");
    return {
      type: isMaterial ? "course" : "url",
      label:
        `[${number}] ${title}`
          .slice(0, 200 - page.length)
          .replace(/[\uD800-\uDBFF]$/, "")
          .trimEnd() + page,
      ...(url ? { url } : {}),
    };
  });
}
