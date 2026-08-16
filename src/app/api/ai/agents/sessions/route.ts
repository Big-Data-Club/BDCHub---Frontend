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

    let res: Response | null = null;
    try {
      res = await fetch(url, {
        method: "GET",
        headers: {
          "X-AI-Secret": process.env.AI_SERVICE_SECRET || "bdc-ai-secret-2026",
        },
        cache: "no-store",
      });
    } catch (fetchErr) {
      if (process.env.MOCK_AI_SERVICE === "true") {
        console.warn("[ai-sessions-proxy] MOCK_AI_SERVICE is true, returning mock sessions for dev UI preview.");
        return NextResponse.json({
          sessions: [
            {
              id: "session-demo-1",
              title: "Thảo luận về thuật toán QuickSort & MergeSort",
              agent_type: agentType || "mentor",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "session-demo-2",
              title: "Hướng dẫn bài tập Cây Nhị Phân",
              agent_type: agentType || "mentor",
              created_at: new Date(Date.now() - 3600000).toISOString(),
              updated_at: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
        });
      }
      throw fetchErr;
    }

    if (!res.ok) {
      throw new Error(`AI service returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Sessions Proxy Error:", error);
    if (process.env.MOCK_AI_SERVICE === "true") {
      return NextResponse.json({
        sessions: [
          {
            id: "session-demo-1",
            title: "Thảo luận về thuật toán QuickSort & MergeSort",
            agent_type: "mentor",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
    }
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
      let res: Response | null = null;
      try {
        res = await fetch(`${AI_SERVICE_URL}/ai/agents/sessions/new`, {
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
      } catch (fetchErr) {
        if (process.env.MOCK_AI_SERVICE === "true") {
          const mockId = `session-demo-${Date.now()}`;
          return NextResponse.json({
            session_id: mockId,
            id: mockId,
            title: "Cuộc trò chuyện mới",
            agent_type: body.agent_type || "mentor",
            created_at: new Date().toISOString(),
          });
        }
        throw fetchErr;
      }
  
      if (!res.ok) {
        throw new Error(`AI service returned ${res.status}`);
      }
  
      const data = await res.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("AI Sessions New Proxy Error:", error);
      if (process.env.MOCK_AI_SERVICE === "true") {
        const mockId = `session-demo-${Date.now()}`;
        return NextResponse.json({
          session_id: mockId,
          id: mockId,
          title: "Cuộc trò chuyện mới",
          agent_type: "mentor",
          created_at: new Date().toISOString(),
        });
      }
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }
  }
