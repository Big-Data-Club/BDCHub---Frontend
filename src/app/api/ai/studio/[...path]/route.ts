import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/request-origin";

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
  const route = path.join("/");
  const uuid = "[0-9a-fA-F-]{36}";
  if (!new RegExp(`^(projects|projects/${uuid}(?:/(?:context|plan|sections|generate|youtube|publish|sections/[0-9]+/render-preview|uploads/${uuid}))?|media/${uuid})$`).test(route)) {
    return NextResponse.json({ error: "Unknown Studio route" }, { status: 404 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(
    (session.user as any).id ?? (session.user as any).userId ?? 0
  );

  const searchParams = new URLSearchParams(req.nextUrl.search);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  searchParams.set("user_id", String(userId));
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const url = `${AI_SERVICE_URL}/ai/studio/${path.join("/")}${queryString}`;
  const headers: Record<string, string> = { "X-AI-Secret": AI_SECRET };
  if (req.headers.has("range")) headers.Range = req.headers.get("range")!;
  let body: string | undefined;

  if (req.method !== "GET") {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
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
    const responseHeaders = new Headers({ "Cache-Control": "private, no-store" });
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "content-disposition", "x-content-type-options", "content-security-policy", "referrer-policy"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
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
