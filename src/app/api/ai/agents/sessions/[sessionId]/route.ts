import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";

    const res = await fetch(`${AI_SERVICE_URL}/ai/agents/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        "X-AI-Secret": process.env.AI_SERVICE_SECRET || "bdc-ai-secret-2026",
      },
    });

    if (!res.ok) {
      throw new Error(`AI service returned ${res.status}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("AI Session Delete Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
