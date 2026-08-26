import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generic proxy for the Content Studio AI endpoints.
 * Forwards /api/ai/studio/* to ${AI_SERVICE_URL}/ai/studio/* with the
 * internal secret, injecting the session user id into JSON bodies.
 */
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET || "";

function injectUser(bodyText: string | null, userId: number): string {
  if (!bodyText) return bodyText ?? "";
  try {
    const json = JSON.parse(bodyText);
    return JSON.stringify({ ...json, user_id: userId });
  } catch {
    return bodyText;
  }
}

async function forward(req: NextRequest, path: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(
    (session.user as any).id ?? (session.user as any).userId ?? 0
  );

  const url = `${AI_SERVICE_URL}/ai/studio/${path.join("/")}${req.nextUrl.search}`;
  const headers: Record<string, string> = { "X-AI-Secret": AI_SECRET };
  let body: string | undefined;

  if (req.method !== "GET") {
    headers["Content-Type"] = "application/json";
    body = injectUser(await req.text(), userId);
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
    console.error("[studio-proxy] failed:", err.message);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
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
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
