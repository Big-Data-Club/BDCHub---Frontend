export interface StudyAlert {
  id?: string;
  group_key?: string;
  user_id?: number;
  course_id: number;
  course_title?: string;
  section_id?: number;
  content_id?: number;
  node_id?: number | null;
  quiz_id?: number | null;
  category?: "learning" | "suggestion";
  alert_type: string;
  title?: string;
  entity_title?: string;
  href?: string;
  alert_message: string;
  detected_at: string;
}

const learningTypes = new Set([
  "course_published", "course_updated", "section_added", "section_updated", "section_removed",
  "content_added", "content_updated", "content_removed", "new_content", "quiz_deadline",
]);
export function notificationCategory(alert: StudyAlert): "learning" | "suggestion" {
  return learningTypes.has(alert.alert_type) ? "learning" : "suggestion";
}
export function notificationKey(alert: StudyAlert): string {
  return alert.id || `legacy:${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}:${alert.quiz_id ?? ""}`;
}
export function notificationToastKey(alert: StudyAlert): string {
  return alert.alert_type === "content_added" && alert.group_key ? alert.group_key : notificationKey(alert);
}
export function notificationHref(alert: StudyAlert): string {
  if (alert.href?.startsWith("/lms/") && !alert.href.includes("\\")) return alert.href;
  if (!Number.isSafeInteger(alert.course_id) || alert.course_id <= 0) return "/lms/student";
  if (alert.content_id) return `/lms/student/courses/${alert.course_id}/learn?contentId=${alert.content_id}`;
  return `/lms/student/courses/${alert.course_id}/learn`;
}
export function notificationTitle(alert: StudyAlert): string {
  if (alert.title) return alert.title;
  return notificationCategory(alert) === "learning" ? "Cập nhật học tập" : "Gợi ý học tập";
}
export function notificationMessage(alert: StudyAlert): string {
  // Compatible with an older BFF during a rolling deployment.
  if (!alert.id && !alert.course_title && /(?:course|node)\s*id\s*:?\s*\d+/i.test(alert.alert_message)) {
    return notificationCategory(alert) === "learning" ? "Có cập nhật trong khóa học của bạn. Mở để xem chi tiết." : "Bạn có thể quay lại tiếp tục lộ trình học khi sẵn sàng.";
  }
  return alert.alert_message;
}

interface Course { course_id: number; course_title: string }
interface Target { course_id: number; node_id: number; content_id: number; content_title: string }

// Enrich in one pass using the LMS-owned, authorized scope. Never surface raw IDs.
export function suggestionAlerts(raw: StudyAlert[], courses: Course[], targets: Target[], userId: number): StudyAlert[] {
  const byCourse = new Map(courses.map(course => [course.course_id, course]));
  const byNode = new Map(targets.map(target => [`${target.course_id}:${target.node_id}`, target]));
  const titles: Record<string, string> = {
    concept_struggle: "Củng cố kiến thức", low_performance: "Luyện tập thêm",
    inactivity: "Tiếp tục hành trình học", positive_reinforcement: "Ghi nhận tiến bộ",
    ai_suggestion: "Gỡ vướng cùng trợ giảng", flashcard_suggestion: "Ôn thẻ ghi nhớ",
  };
  const results = new Map<string, StudyAlert>();
  for (const alert of raw) {
    const course = byCourse.get(Number(alert.course_id));
    if (!course || !titles[alert.alert_type]) continue;
    const target = byNode.get(`${alert.course_id}:${alert.node_id}`);
    const topic = target?.content_title ? `“${target.content_title}” trong khóa “${course.course_title}”` : `khóa “${course.course_title}”`;
    const messages: Record<string, string> = {
      concept_struggle: `Dành chút thời gian củng cố kiến thức ở ${topic}.`,
      low_performance: `Luyện tập thêm ở ${topic} dựa trên kết quả gần đây của bạn.`,
      inactivity: `Bạn có thể tiếp tục ${topic} khi sẵn sàng.`,
      positive_reinforcement: `Bạn đang tiến bộ trong ${topic}. Tiếp tục phát huy nhé!`,
      ai_suggestion: `Nhờ trợ giảng giải thích phần bạn còn vướng ở ${topic}.`,
      flashcard_suggestion: `Thử ôn lại từ khóa bằng thẻ ghi nhớ trong ${topic}.`,
    };
    const detected = new Date(alert.detected_at).getTime();
    if (!Number.isFinite(detected)) continue;
    const week = Math.floor(detected / (7 * 86400000));
    const id = `suggestion:${alert.alert_type}:${course.course_id}:${alert.node_id || ""}:${week}`;
    results.set(id, { id, user_id: userId, course_id: course.course_id, course_title: course.course_title,
      node_id: alert.node_id, content_id: target?.content_id, category: "suggestion", alert_type: alert.alert_type,
      title: titles[alert.alert_type], entity_title: target?.content_title, alert_message: messages[alert.alert_type],
      detected_at: alert.detected_at, href: `/lms/student/courses/${course.course_id}/learn${target ? `?contentId=${target.content_id}` : ""}` });
  }
  return [...results.values()].sort((a,b) => Number(b.alert_type === "concept_struggle") - Number(a.alert_type === "concept_struggle") || new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()).slice(0, 8);
}
