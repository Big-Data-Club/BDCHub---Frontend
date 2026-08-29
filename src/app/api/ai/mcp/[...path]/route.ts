import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js BFF proxy for MCP Server endpoints.
 * Forwards /api/ai/mcp/* to ${AI_SERVICE_URL}/mcp/* with authenticated X-User-Id header.
 */
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

async function forward(req: NextRequest, path: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(
    (session.user as any).id ?? (session.user as any).userId ?? 0
  );
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Invalid session identity" }, { status: 401 });
  }

  const validPath =
    (path.length === 1 && path[0] === "keys") ||
    (path.length === 2 && path[0] === "keys" && /^\d+$/.test(path[1]));
  if (!validPath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  }

  const searchParams = new URLSearchParams(req.nextUrl.search);
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const url = `${AI_SERVICE_URL}/mcp/${path.join("/")}${queryString}`;
  const headers: Record<string, string> = {
    "X-AI-Secret": AI_SECRET,
    "X-User-Id": String(userId),
  };

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    body = await req.text();
  }

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });
    const data = await upstream.text();
    return new NextResponse(data, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[mcp-proxy] failed:", err.message);
    return NextResponse.json({ error: "MCP service unavailable" }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
