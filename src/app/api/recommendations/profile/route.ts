import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const PERSONALIZE_SERVICE_URL = process.env.PERSONALIZE_SERVICE_URL || "http://personalize-service:8082";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

function sessionUserId(session: Session | null): number {
  return Number((session?.user as any)?.id ?? (session?.user as any)?.userId ?? 0);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const upstream = await fetch(`${PERSONALIZE_SERVICE_URL}/personalize/student/${userId}/onboarding`, {
      headers: { "X-AI-Secret": AI_SECRET },
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[recommendation-profile] load failed", error);
    return NextResponse.json({ error: "Personalization service unavailable" }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const categories = Array.isArray(body.interested_categories)
      ? body.interested_categories
          .filter((value: unknown): value is string => typeof value === "string")
          .map((value: string) => value.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];
    const upstream = await fetch(`${PERSONALIZE_SERVICE_URL}/personalize/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AI-Secret": AI_SECRET },
      body: JSON.stringify({
        user_id: userId,
        interested_categories: categories,
        target_career: typeof body.target_career === "string" ? body.target_career.trim().slice(0, 120) : "",
        experience_level: ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(body.experience_level)
          ? body.experience_level
          : null,
      }),
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[recommendation-profile] save failed", error);
    return NextResponse.json({ error: "Personalization service unavailable" }, { status: 502 });
  }
}
