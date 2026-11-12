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
    // Global account roles and LMS roles are separate authorities. A teacher
    // or admin may also be an LMS learner; never trust a browser role override.
    const token = (session as any).accessToken as string | undefined;
    if (!token) return NextResponse.json({ error: "Missing LMS session" }, { status: 401 });
    const signal = AbortSignal.timeout(2500);
    const rolesResponse = await fetch(`${process.env.LMS_API_URL || "http://lms-service:8081"}/api/v1/me/roles`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal,
    });
    if (!rolesResponse.ok) return NextResponse.json({ error: "Cannot verify LMS learner role" }, { status: rolesResponse.status === 401 ? 401 : 503 });
    const roles = (await rolesResponse.json()).data?.roles;
    if (!Array.isArray(roles) || !roles.some((role: unknown) => role === "STUDENT" || role === "ROLE_STUDENT")) {
      return NextResponse.json({ error: "LMS learner access required" }, { status: 403 });
    }
    const upstream = await fetch(`${RECOMMENDER_SERVICE_URL}/v1/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AI-Secret": AI_SECRET },
      body: JSON.stringify({
        ...body,
        user_id: userId,
        context: {
          ...(body.context || {}),
          role: "student",
        },
      }),
      cache: "no-store",
      signal,
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
