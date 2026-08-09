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
  badges: {
    type: "new_content" | "goal_match" | "continue_learning" | "almost_done" | "popular" | "new_course";
    text: string;
    value?: unknown;
  }[];
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

export interface LearningPreferenceProfile {
  user_id?: number;
  interested_categories: string[];
  target_career?: string | null;
  experience_level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  profile_available?: boolean;
}

export async function getLearningPreferenceProfile(): Promise<LearningPreferenceProfile> {
  const response = await fetch("/api/recommendations/profile", { cache: "no-store" });
  if (!response.ok) throw new Error("Không thể tải hồ sơ cá nhân hóa");
  return response.json();
}

export async function saveLearningPreferenceProfile(
  profile: Omit<LearningPreferenceProfile, "user_id" | "profile_available">,
): Promise<LearningPreferenceProfile> {
  const response = await fetch("/api/recommendations/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Không thể lưu hồ sơ cá nhân hóa");
  return response.json();
}

export async function getRecommendations(input: {
  surface: "chat" | "lesson_sidebar" | "dashboard" | "course_discovery";
  courseId?: number;
  lessonId?: number;
  contentId?: number;
  timeBudgetMinutes?: number;
  preferFormat?: "practice" | "theory" | "mixed";
  limit?: number;
  goal?: string;
  interestedCategories?: string[];
  experienceLevel?: string;
  profileResolved?: boolean;
  candidates?: Array<{
    entity_type?: "course";
    entity_id: number;
    title: string;
    description?: string;
    category?: string;
    level?: string;
    href?: string;
    enrolled?: boolean;
    progress_percent?: number;
    enrollment_count?: number;
    published_at?: string;
    updated_at?: string;
    last_activity_at?: string;
    new_content_count?: number;
  }>;
}): Promise<RecommendationSet> {
  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      surface: input.surface,
      candidate_types: input.surface === "course_discovery" ? ["course"] : ["next_action", "course"],
      limit: input.limit,
      candidates: input.candidates ?? [],
      context: {
        course_id: input.courseId,
        lesson_id: input.lessonId,
        content_id: input.contentId,
        time_budget_minutes: input.timeBudgetMinutes,
        goal: input.goal,
        interested_categories: input.interestedCategories ?? [],
        experience_level: input.experienceLevel,
        profile_resolved: input.profileResolved ?? false,
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

const ATTRIBUTION_PREFIX = "bdc:recommendation-attribution:";

export function rememberRecommendationAttribution(
  item: RecommendationItem,
  recommendationSetId: string,
  surface: string,
): void {
  if (typeof window === "undefined" || !item.entity.course_id) return;
  try {
    sessionStorage.setItem(`${ATTRIBUTION_PREFIX}${item.entity.course_id}`, JSON.stringify({
      item,
      recommendationSetId,
      surface,
      storedAt: Date.now(),
    }));
  } catch {
    // Attribution is best-effort and must never block navigation.
  }
}

export function consumeRecommendationAttribution(courseId: number): {
  item: RecommendationItem;
  recommendationSetId: string;
  surface: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `${ATTRIBUTION_PREFIX}${courseId}`;
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.item?.tracking_token || Date.now() - Number(parsed.storedAt) > 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}
