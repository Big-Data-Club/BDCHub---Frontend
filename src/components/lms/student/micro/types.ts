export interface MicroLessonContext {
  /** Lesson row id from `micro_lessons.id` (Postgres). Null for regular TEXT content. */
  lessonId: number | null;
  /** Lesson title - shown in headers and Ask-AI greeting. */
  lessonTitle: string;
  /** Verbatim Markdown body - fed to the chatbot as system_context. */
  lessonText: string;
  /** Course this lesson belongs to. */
  courseId: number;
  /**
   * Knowledge node the lesson is anchored to (nullable - some draft
   * lessons have no node attached yet).
   */
  nodeId: number | null;
  /** Primary content ID (from `contents` table). Used as fallback anchor if lessonId is null. */
  contentId?: number | null;
  /** Display language: "vi" | "en". Defaults to "vi". */
  language?: "vi" | "en";
}


