import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

// The browser never receives the internal AI secret.  Identity is taken from
// NextAuth, not from a user_id supplied by the browser.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = Number((session?.user as any)?.id ?? (session?.user as any)?.userId ?? 0);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${AI_SERVICE_URL}/ai/revisions/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AI-Secret": AI_SECRET },
      body: JSON.stringify({ ...payload, user_id: userId }),
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("[ai-revisions-proxy] failed:", error?.message);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
