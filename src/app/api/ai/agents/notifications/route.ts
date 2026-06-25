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

  try {
    const upstreamUrl = `${AI_SERVICE_URL}/ai/agents/notifications?user_id=${userId}`;
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "X-AI-Secret": AI_SECRET,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[notifications-proxy] GET failed:", err.message);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
