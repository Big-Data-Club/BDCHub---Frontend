import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Priority: Cloudflare -> reverse proxy forwarded -> real-ip header -> fallback
  const cfIp      = request.headers.get("cf-connecting-ip");
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp    = request.headers.get("x-real-ip");

  const ip =
    cfIp ||
    forwarded?.split(",")[0]?.trim() ||
    realIp ||
    "Unknown";

  return NextResponse.json({ ip });
}
