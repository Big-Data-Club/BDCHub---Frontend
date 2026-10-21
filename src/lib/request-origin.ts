import { NextRequest } from "next/server";

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    return [request.nextUrl.host, request.headers.get("host"), forwarded].includes(url.host);
  } catch { return false; }
}
