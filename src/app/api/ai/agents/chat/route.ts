/**
 * Next.js Route Handler - SSE proxy for agent chat.
 *
 * This streams the response from ai-service directly to the browser.
 * Using a Route Handler (instead of Go proxy) because:
 *   1. SSE requires unbuffered streaming - Go Gin doesn't handle this well.
 *   2. We can inject auth server-side (user can't spoof user_id).
 *   3. No Go code changes needed.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://ai-service:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse request body
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Inject user identity from JWT (prevent spoofing)
  const userId =
    (session.user as any).id ?? (session.user as any).userId ?? 0;
  body.user_id = Number(userId);

  // Inject user context so the agent knows who it's talking to
  body.user_context = {
    name: session.user.name || undefined,
    email: session.user.email || undefined,
    role: (session.user as any).role || undefined,
  };

  if (!body.message || !body.agent_type) {
    return NextResponse.json(
      { error: "message and agent_type are required" },
      { status: 400 },
    );
  }

  // 3. Forward to ai-service
  try {
    const upstream = await fetch(`${AI_SERVICE_URL}/ai/agents/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AI-Secret": AI_SECRET,
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: errText },
        { status: upstream.status },
      );
    }

    // 4. Pipe SSE stream to client
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: any) {
    console.error("[agent-proxy] Upstream fetch failed:", err.message);

    if (process.env.MOCK_AI_SERVICE === "true") {
      console.warn("[agent-proxy] MOCK_AI_SERVICE is true, streaming mock SSE response for dev UI preview.");
      
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        async start(controller) {
          const events = [
            { type: "thinking", step: "Đang phân tích câu hỏi của bạn..." },
            { type: "text", delta: "Chào bạn! Đây là câu phản hồi **chế độ Mock UI** của AI Mentor.\n\n" },
            { type: "text", delta: "Vì bạn đang bật chế độ `MOCK_AI_SERVICE=true` không có backend AI Service (`ai-service:8000`), mình hiển thị giao diện này để bạn kiểm tra thử layout và chat!\n\n" },
            { type: "text", delta: "### Công thức Toán LaTeX Demo:\n$$E = mc^2$$\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n\n" },
            { type: "text", delta: "Chúc bạn lập trình giao diện vui vẻ! 🎉" },
            { type: "done" },
          ];

          for (const ev of events) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
            await new Promise((r) => setTimeout(r, 200));
          }
          controller.close();
        },
      });

      return new Response(mockStream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 502 },
    );
  }
}
