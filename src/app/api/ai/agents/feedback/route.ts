import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message_id?: number; session_id?: string; rating?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messageId = Number(body.message_id);
  const rating = String(body.rating || "");
  if (!Number.isFinite(messageId) || messageId <= 0) {
    return NextResponse.json({ error: "message_id is required" }, { status: 400 });
  }
  if (!body.session_id || !["like", "dislike"].includes(rating)) {
    return NextResponse.json({ error: "session_id and a like|dislike rating are required" }, { status: 400 });
  }

  const userId = (session.user as any).id ?? (session.user as any).userId ?? 0;

  try {
    const response = await fetch(`${AI_SERVICE_URL}/ai/agents/feedback?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AI-Secret": AI_SECRET },
      body: JSON.stringify({
        message_id: messageId,
        session_id: body.session_id,
        rating,
      }),
    });
    const data = await response.json().catch(() => ({ error: "AI service unavailable" }));
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("[feedback-proxy] POST failed:", err.message);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
