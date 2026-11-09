import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { suggestionAlerts } from "@/lib/notifications/model";

const LMS_URL = process.env.LMS_API_URL || "http://lms-service:8081";
const PERSONALIZE_URL = process.env.PERSONALIZE_SERVICE_URL || "http://personalize-service:8082";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id ?? (session?.user as any)?.userId ?? 0);
  const token = (session as any)?.accessToken;
  if (!userId || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [learning, suggestions] = await Promise.allSettled([
    fetch(`${LMS_URL}/api/v1/notifications`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(3500) }).then(async response => {
      if (!response.ok) throw new Error("LMS notifications unavailable");
      return response.json();
    }),
    fetch(`${PERSONALIZE_URL}/personalize/analytics/gold/struggle-alerts?user_id=${userId}`, {
      headers: { "X-AI-Secret": process.env.AI_SERVICE_SECRET || "" }, cache: "no-store", signal: AbortSignal.timeout(1500),
    }).then(async response => response.ok ? response.json() : []),
  ]);
  // LMS is the access authority; no raw suggestion can bypass that boundary.
  if (learning.status !== "fulfilled") return NextResponse.json({ error: "Thông báo tạm thời chưa sẵn sàng" }, { status: 503 });
  const feed = learning.value;
  const recs = suggestionAlerts(suggestions.status === "fulfilled" && Array.isArray(suggestions.value) ? suggestions.value.slice(0,50) : [], feed.courses || [], feed.targets || [], userId);
  return NextResponse.json({ alerts: [...(feed.alerts || []), ...recs], read_keys: feed.read_keys || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!session?.user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const response = await fetch(`${LMS_URL}/api/v1/notifications/read`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ keys: body.keys }), signal: AbortSignal.timeout(2500) });
    return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Chưa lưu được trạng thái đã đọc" }, { status: 503 });
  }
}
