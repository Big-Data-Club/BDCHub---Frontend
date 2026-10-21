import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";

async function forward(req: NextRequest, path: string[]) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);
  if (!session?.user || !Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const route = path.join("/");
  if (!((req.method === "POST" && route === "flashcard") ||
    (req.method === "GET" && /^jobs\/[0-9a-f-]{36}(\/audio)?$/i.test(route)))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (req.method === "POST" && req.headers.get("origin") !== new URL(process.env.NEXTAUTH_URL || req.url).origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  try {
    const body = req.method === "POST" ? JSON.stringify({ ...await req.json(), user_id: userId }) : undefined;
    const upstream = await fetch(`${AI_SERVICE_URL}/ai/speech/${route}?user_id=${userId}`, {
      method: req.method,
      headers: { "Content-Type": "application/json", "X-AI-Secret": process.env.AI_SERVICE_SECRET || "" },
      body, cache: "no-store", signal: AbortSignal.timeout(30_000),
    });
    return new NextResponse(upstream.body, { status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") || "application/json", "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Giọng neural chưa sẵn sàng." }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path);
}
