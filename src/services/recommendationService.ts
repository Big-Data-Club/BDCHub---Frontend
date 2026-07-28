export type RecommendationEventType = "impression" | "click" | "accept" | "reject" | "dismiss" | "started" | "completed";

export interface RecommendationItem {
  recommendation_id: string;
  entity: { type: string; id: string; course_id?: number };
  action: string;
  title: string;
  description: string;
  href?: string;
  rank: number;
  score: number;
  estimated_minutes?: number;
  confidence: "low" | "medium" | "high";
  why_facts: { code: string; value?: unknown; node_id?: number }[];
  expected_outcome: string;
  tracking_token: string;
}

export interface RecommendationSet {
  request_id: string;
  recommendation_set_id: string;
  policy_version: string;
  model_version: string;
  fallback: boolean;
  clarification_needed: boolean;
  clarification_message?: string;
  items: RecommendationItem[];
}

export async function getRecommendations(input: {
  surface: "chat" | "lesson_sidebar" | "dashboard";
  courseId?: number;
  lessonId?: number;
  contentId?: number;
  timeBudgetMinutes?: number;
  preferFormat?: "practice" | "theory" | "mixed";
}): Promise<RecommendationSet> {
  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      surface: input.surface,
      candidate_types: ["next_action"],
      context: {
        course_id: input.courseId,
        lesson_id: input.lessonId,
        content_id: input.contentId,
        time_budget_minutes: input.timeBudgetMinutes,
      },
      conversation: { constraints: input.preferFormat ? { prefer_format: input.preferFormat } : {} },
    }),
  });
  if (!response.ok) throw new Error("Không thể tải gợi ý học tập");
  return response.json();
}

export function trackRecommendationEvent(
  item: RecommendationItem,
  recommendationSetId: string,
  type: RecommendationEventType,
  surface: string,
): void {
  void fetch("/api/recommendations/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      // Stable IDs make browser retries and React remounts idempotent.
      event_id: `${item.recommendation_id}:${type}`,
      event_type: type,
      recommendation_id: item.recommendation_id,
      recommendation_set_id: recommendationSetId,
      tracking_token: item.tracking_token,
      surface,
      course_id: item.entity.course_id,
      entity_type: item.entity.type,
      entity_id: item.entity.id,
      rank: item.rank,
    }),
  }).catch(() => undefined);
}
