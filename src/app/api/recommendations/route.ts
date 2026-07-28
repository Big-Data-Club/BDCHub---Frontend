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
    if (!userId) return NextResponse.json({ error: "Invalid user session" }, { status: 401 });
    const upstream = await fetch(`${RECOMMENDER_SERVICE_URL}/v1/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AI-Secret": AI_SECRET },
      body: JSON.stringify({
        ...body,
        user_id: userId,
        context: {
          ...(body.context || {}),
          role: String((session.user as any).role || "student").toLowerCase(),
        },
      }),
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[recommendations] request failed", error);
    return NextResponse.json({ error: "Recommendation service unavailable" }, { status: 502 });
  }
}
