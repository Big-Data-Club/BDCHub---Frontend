import { createHash } from "crypto";
import { requireYoutubeRole } from "@/lib/youtube-auth";
import { NextRequest, NextResponse } from 'next/server';
import youtubeTokenManager from '@/services/lms/youtubeTokenManager';

export async function POST(request: NextRequest) {
  const denied = await requireYoutubeRole(request);
  if (denied) return denied;
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || request.cookies.get("bdc_youtube_code")?.value !== createHash("sha256").update(code).digest("hex")) {
      return NextResponse.json({ error: "Complete the OAuth flow from the admin page" }, { status: 403 });
    }
    // Exchange code for tokens and save
    await youtubeTokenManager.exchangeCodeForTokens(code);

    const response = NextResponse.json({ success: true, message: "Shared YouTube channel connected" });
    response.cookies.set("bdc_youtube_code", "", { path: "/api/youtube", maxAge: 0 });
    return response;
  } catch {
    console.warn("YouTube operation failed; inspect connection and quota");
    return NextResponse.json(
      { error: 'Failed to connect shared YouTube channel' },
      { status: 500 }
    );
  }
}