import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const RECOMMENDER_SERVICE_URL = process.env.RECOMMENDER_SERVICE_URL || "http://recommender-service:8086";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const userId = Number((session.user as any).id ?? (session.user as any).userId ?? 0);
    const upstream = await fetch(`${RECOMMENDER_SERVICE_URL}/v1/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AI-Secret": AI_SECRET },
      body: JSON.stringify({ ...body, user_id: userId }),
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Interaction tracking never blocks an explicit user action.
    console.warn("[recommendation-events] request failed", error);
    return NextResponse.json({ accepted: false }, { status: 202 });
  }
}
