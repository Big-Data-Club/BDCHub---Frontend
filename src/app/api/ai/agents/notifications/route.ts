import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id ?? (session.user as any).userId ?? 0;
  const accessToken = (session as any).accessToken;

  // 1. Fetch study alerts from personalization service
  let alerts: any[] = [];
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
      alerts = data.alerts || [];
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

      // A. Recommend courses that the student has not enrolled in yet
      const recommendedCourses = allCourses.filter((c: any) => !enrolledCourseIds.has(c.id) && c.status === "PUBLISHED");
      recommendedCourses.forEach((course: any) => {
        const isNew = new Date(course.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
        alerts.push({
          user_id: userId,
          course_id: course.id,
          node_id: null,
          alert_type: "recommendation",
          alert_message: isNew
            ? `Khóa học mới ra mắt: "${course.title}". Rất phù hợp với định hướng học tập của bạn. Bấm để tham gia ngay!`
            : `Gợi ý khóa học phù hợp: "${course.title}". Giúp củng cố và nâng cao kiến thức chuyên môn. Tham khảo ngay!`,
          detected_at: course.created_at || new Date().toISOString()
        });
      });

      // B. Fetch course sections for top enrolled courses to detect quiz deadlines & new content
      // Inspect first 3 enrolled courses to keep latency low
      const coursesToInspect = myEnrollments.slice(0, 3);
      await Promise.all(coursesToInspect.map(async (en: any) => {
        try {
          const sectionsRes = await fetch(`${LMS_API_URL}/api/v1/courses/${en.course_id}/sections`, {
            headers: { "Authorization": `Bearer ${accessToken}` },
          }).then(r => r.ok ? r.json() : null);

          const sections = sectionsRes?.data ?? [];
          for (const sec of sections) {
            const contentRes = await fetch(`${LMS_API_URL}/api/v1/sections/${sec.id}/content`, {
              headers: { "Authorization": `Bearer ${accessToken}` },
            }).then(r => r.ok ? r.json() : null);

            const contents = contentRes?.data ?? [];
            for (const item of contents) {
              // Quiz Deadlines
              if (item.type === "QUIZ" && item.is_published) {
                const metadata = item.metadata || {};
                const availableUntil = metadata.available_until;
                if (availableUntil) {
                  const deadlineTime = new Date(availableUntil).getTime();
                  const now = Date.now();
                  const threeDays = 3 * 24 * 60 * 60 * 1000;

                  if (deadlineTime > now && (deadlineTime - now) < threeDays) {
                    const daysLeft = Math.ceil((deadlineTime - now) / (24 * 60 * 60 * 1000));
                    alerts.push({
                      user_id: userId,
                      course_id: en.course_id,
                      node_id: null,
                      quiz_id: metadata.quiz_id || item.id,
                      alert_type: "quiz_deadline",
                      alert_message: `Hạn chót làm bài kiểm tra "${item.title}" trong khóa "${en.course_title}" còn ${daysLeft} ngày (Hạn: ${new Date(availableUntil).toLocaleDateString("vi-VN")})!`,
                      detected_at: item.created_at || new Date().toISOString()
                    });
                  }
                }
              }

              // New Content (added in the last 7 days)
              const itemTime = new Date(item.created_at).getTime();
              const isNewContent = itemTime > Date.now() - 7 * 24 * 60 * 60 * 1000;
              if (isNewContent && item.is_published) {
                alerts.push({
                  user_id: userId,
                  course_id: en.course_id,
                  node_id: item.node_id || null,
                  alert_type: "new_content",
                  alert_message: `Nội dung mới vừa được thêm vào bài "${sec.title}": "${item.title}". Hãy cập nhật bài học ngay!`,
                  detected_at: item.created_at
                });
              }
            }
          }
        } catch (secErr: any) {
          console.error(`[notifications] Failed to fetch sections for course ${en.course_id}:`, secErr.message);
        }
      }));

    } catch (lmsErr: any) {
      console.error("[notifications-proxy] LMS fetch failed:", lmsErr.message);
    }
  }

  // Sort alerts: most recent first
  alerts.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

  return NextResponse.json(alerts);
}
