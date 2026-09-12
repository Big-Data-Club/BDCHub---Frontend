import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

// Anti-spam budget: the bell shows what matters now, not a course catalog.
const MAX_TOTAL_ALERTS = 15;
const MAX_RECOMMENDATION_ALERTS = 3;
const MAX_NEW_CONTENT_ALERTS = 4;
const NEW_COURSE_WINDOW_DAYS = 30;
const NEW_CONTENT_WINDOW_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

interface StudyAlert {
  user_id: number;
  course_id: number;
  node_id?: number | null;
  quiz_id?: number | null;
  alert_type: "concept_struggle" | "inactivity" | "recommendation" | "quiz_deadline" | "new_content";
  alert_message: string;
  detected_at: string;
  _priority?: number; // internal: lower = more important, stripped before responding
}

const PRIORITY: Record<StudyAlert["alert_type"], number> = {
  quiz_deadline: 1,
  concept_struggle: 2,
  inactivity: 3,
  new_content: 4,
  recommendation: 5,
};

function alertKey(alert: StudyAlert): string {
  return `${alert.alert_type}:${alert.course_id}:${alert.node_id ?? ""}:${alert.quiz_id ?? ""}`;
}

function isPublished(course: any): boolean {
  return course.status === "PUBLISHED" || course.status === "published" || course.is_published === true;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id ?? (session.user as any).userId ?? 0;
  const accessToken = (session as any).accessToken;

  // 1. Fetch study alerts from personalization service (already personalized & scarce).
  let alerts: StudyAlert[] = [];
  try {
    const upstreamUrl = `${AI_SERVICE_URL}/ai/agents/notifications?user_id=${userId}`;
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "X-AI-Secret": AI_SECRET,
      },
    });

    if (response.ok) {
      const data = await response.json();
      alerts = (data.alerts || []).map((alert: any) => ({ ...alert, _priority: PRIORITY[alert.alert_type] ?? 4 }));
    }
  } catch (err: any) {
    console.error("[notifications-proxy] personal alerts fetch failed:", err.message);
  }

  // 2. Fetch courses and enrollments from Go LMS service to produce recommendations and deadlines
  if (accessToken) {
    const LMS_API_URL = process.env.LMS_API_URL || "http://lms-backend:8081";
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`${LMS_API_URL}/api/v1/courses`, {
          headers: { "Authorization": `Bearer ${accessToken}` },
        }).then(r => r.ok ? r.json() : null),
        fetch(`${LMS_API_URL}/api/v1/enrollments/my`, {
          headers: { "Authorization": `Bearer ${accessToken}` },
        }).then(r => r.ok ? r.json() : null)
      ]);

      const allCourses = coursesRes?.data ?? [];
      const myEnrollments = enrollmentsRes?.data ?? [];
      const enrolledCourseIds = new Set(myEnrollments.map((e: any) => e.course_id));

      // A. Recommend at most a few meaningful courses, ranked by relevance to the
      // learner: same category as courses they already study, recent publication,
      // then popularity. Old unrelated courses are never recommended.
      const enrolledCategories = new Set(
        myEnrollments
          .map((en: any) => String(en.course_category || "").trim().toLowerCase())
          .filter((c: string) => c.length > 0)
      );

      const now = Date.now();
      const recommendations = allCourses
        .filter((course: any) => !enrolledCourseIds.has(course.id) && isPublished(course))
        .map((course: any) => {
          const timeStr = course.published_at || course.created_at || course.createdAt;
          const publishedTime = timeStr ? new Date(timeStr).getTime() : 0;
          const ageDays = publishedTime > 0 ? (now - publishedTime) / DAY_MS : Number.POSITIVE_INFINITY;
          const category = String(course.category || "").trim().toLowerCase();
          const categoryMatch = category.length > 0 && enrolledCategories.has(category);
          if (ageDays > NEW_COURSE_WINDOW_DAYS && !categoryMatch) return null;

          const recency = Math.max(0, 1 - ageDays / NEW_COURSE_WINDOW_DAYS);
          const popularity = Math.min(1, Math.log1p(course.enrollment_count || 0) / Math.log(21));
          const score = (categoryMatch ? 0.5 : 0) + 0.3 * recency + 0.2 * popularity;
          return { course, ageDays, categoryMatch, score };
        })
        .filter((entry: any): entry is NonNullable<typeof entry> => entry !== null)
        .sort((a: any, b: any) => b.score - a.score || a.ageDays - b.ageDays)
        .slice(0, MAX_RECOMMENDATION_ALERTS);

      recommendations.forEach(({ course, ageDays, categoryMatch }: any) => {
        const timeStr = course.published_at || course.created_at || course.createdAt;
        const isNew = ageDays <= NEW_COURSE_WINDOW_DAYS;
        let message: string;
        if (isNew && categoryMatch) {
          message = `Khóa học mới "${course.title}" vừa ra mắt, cùng chủ đề với khóa bạn đang học.`;
        } else if (isNew) {
          message = `Khóa học mới vừa ra mắt: "${course.title}". Khám phá xem có phù hợp với bạn không.`;
        } else {
          message = `Gợi ý cho bạn: "${course.title}" cùng chủ đề với các khóa bạn đang theo học.`;
        }
        alerts.push({
          user_id: userId,
          course_id: course.id,
          node_id: null,
          alert_type: "recommendation",
          alert_message: message,
          detected_at: timeStr || new Date().toISOString(),
          _priority: PRIORITY.recommendation,
        });
      });

      // B. Quiz deadlines stay individual (time-sensitive), new content is grouped
      // per section so a teacher uploading many files produces one alert, not one
      // per file.
      const coursesToInspect = myEnrollments.slice(0, 10);
      const newContentGroups: { sectionTitle: string; course: any; items: any[] }[] = [];

      await Promise.all(coursesToInspect.map(async (en: any) => {
        try {
          const sectionsRes = await fetch(`${LMS_API_URL}/api/v1/courses/${en.course_id}/sections`, {
            headers: { "Authorization": `Bearer ${accessToken}` },
          }).then(r => r.ok ? r.json() : null);

          const sections = sectionsRes?.data ?? [];
          const contentsPerSection = await Promise.all(sections.map(async (sec: any) => {
            try {
              const contentRes = await fetch(`${LMS_API_URL}/api/v1/sections/${sec.id}/content`, {
                headers: { "Authorization": `Bearer ${accessToken}` },
              }).then(r => r.ok ? r.json() : null);
              return { sec, contents: contentRes?.data ?? [] };
            } catch {
              return { sec, contents: [] as any[] };
            }
          }));

          for (const { sec, contents } of contentsPerSection) {
            const freshItems: any[] = [];
            for (const item of contents) {
              const isPublishedItem = item.is_published !== false;

              // Quiz Deadlines
              if (item.type === "QUIZ" && isPublishedItem) {
                const metadata = item.metadata || {};
                const availableUntil = metadata.available_until;
                if (availableUntil) {
                  const deadlineTime = new Date(availableUntil).getTime();
                  if (deadlineTime > now && (deadlineTime - now) < 3 * DAY_MS) {
                    const daysLeft = Math.ceil((deadlineTime - now) / DAY_MS);
                    alerts.push({
                      user_id: userId,
                      course_id: en.course_id,
                      node_id: null,
                      quiz_id: metadata.quiz_id || item.id,
                      alert_type: "quiz_deadline",
                      alert_message: `Hạn chót làm bài kiểm tra "${item.title}" trong khóa "${en.course_title || 'Khóa học'}" còn ${daysLeft} ngày (Hạn: ${new Date(availableUntil).toLocaleDateString("vi-VN")}).`,
                      detected_at: item.created_at || new Date().toISOString(),
                      _priority: PRIORITY.quiz_deadline,
                    });
                  }
                }
              }

              // New Content (added in the last 14 days)
              const createdAt = item.created_at || item.createdAt;
              const itemTime = createdAt ? new Date(createdAt).getTime() : 0;
              if (isPublishedItem && itemTime > now - NEW_CONTENT_WINDOW_DAYS * DAY_MS) {
                freshItems.push({ ...item, itemTime });
              }
            }

            if (freshItems.length > 0) {
              newContentGroups.push({
                sectionTitle: sec.title || "Bài học",
                course: en,
                items: freshItems.sort((a, b) => b.itemTime - a.itemTime),
              });
            }
          }
        } catch (err: any) {
          console.error(`[notifications-proxy] failed inspecting course ${en.course_id}:`, err.message);
        }
      }));

      newContentGroups
        .sort((a, b) => b.items[0].itemTime - a.items[0].itemTime)
        .slice(0, MAX_NEW_CONTENT_ALERTS)
        .forEach((group) => {
          const titles = group.items.slice(0, 2).map((item: any) => `"${item.title}"`).join(", ");
          const extra = group.items.length - 2;
          const suffix = extra > 0 ? ` và ${extra} nội dung khác` : "";
          alerts.push({
            user_id: userId,
            course_id: group.course.course_id,
            node_id: group.items[0].node_id || null,
            alert_type: "new_content",
            alert_message: `Nội dung mới trong "${group.sectionTitle}" (${group.course.course_title || "Khóa học"}): ${titles}${suffix}.`,
            detected_at: new Date(group.items[0].itemTime).toISOString(),
            _priority: PRIORITY.new_content,
          });
        });

    } catch (lmsErr: any) {
      console.error("[notifications-proxy] LMS fetch failed:", lmsErr.message);
    }
  }

  // 3. Final guard: dedupe, then keep only the most important alerts so the bell
  // never floods the learner.
  const seenKeys = new Set<string>();
  const seenMessages = new Set<string>();
  alerts = alerts.filter((alert) => {
    const key = alertKey(alert);
    if (seenKeys.has(key) || seenMessages.has(alert.alert_message)) return false;
    seenKeys.add(key);
    seenMessages.add(alert.alert_message);
    return true;
  });

  alerts.sort((a, b) =>
    (a._priority ?? 4) - (b._priority ?? 4) ||
    new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
  );
  alerts = alerts.slice(0, MAX_TOTAL_ALERTS);

  return NextResponse.json(alerts.map(({ _priority, ...alert }) => alert));
}
