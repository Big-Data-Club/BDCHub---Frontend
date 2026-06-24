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
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course_id");

  const urlParams = new URLSearchParams();
  urlParams.append("user_id", String(userId));
  if (courseId) {
    urlParams.append("course_id", courseId);
  }

  try {
    const upstreamUrl = `${AI_SERVICE_URL}/ai/agents/notebook?${urlParams.toString()}`;
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
    console.error("[notebook-proxy] GET failed:", err.message);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id ?? (session.user as any).userId ?? 0;
  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get("id");

  if (!entryId) {
    return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
  }

  try {
    const upstreamUrl = `${AI_SERVICE_URL}/ai/agents/notebook/${entryId}?user_id=${userId}`;
    const response = await fetch(upstreamUrl, {
      method: "DELETE",
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
    console.error("[notebook-proxy] DELETE failed:", err.message);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
