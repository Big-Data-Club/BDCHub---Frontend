import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get("agent_type");
    const limit = searchParams.get("limit") || "10";
    
    const userId = (session.user as any).id ?? (session.user as any).userId ?? 0;

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
    let url = `${AI_SERVICE_URL}/ai/agents/sessions?user_id=${userId}&limit=${limit}`;
    if (agentType) {
        url += `&agent_type=${agentType}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-AI-Secret": process.env.AI_SERVICE_SECRET || "bdc-ai-secret-2026",
      },
      // Do not cache since sessions are updated frequently
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`AI service returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Sessions Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to list sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const userId = (session.user as any).id ?? (session.user as any).userId ?? 0;
  
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
      const res = await fetch(`${AI_SERVICE_URL}/ai/agents/sessions/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AI-Secret": process.env.AI_SERVICE_SECRET || "bdc-ai-secret-2026",
        },
        body: JSON.stringify({
            user_id: Number(userId),
            agent_type: body.agent_type,
            course_id: body.course_id,
        })
      });
  
      if (!res.ok) {
        throw new Error(`AI service returned ${res.status}`);
      }
  
      const data = await res.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("AI Sessions New Proxy Error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }
  }
