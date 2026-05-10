import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await context.params;
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
    const res = await fetch(
        `${AI_SERVICE_URL}/ai/agents/sessions/${sessionId}/messages?limit=${limit}`, 
        {
            method: "GET",
            headers: {
                "X-AI-Secret": process.env.AI_SERVICE_SECRET || "bdc-ai-secret-2026",
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
      throw new Error(`AI service returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Session Messages Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
