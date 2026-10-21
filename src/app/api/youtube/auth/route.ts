import { randomBytes } from "crypto";
import { requireYoutubeRole } from "@/lib/youtube-auth";
import { NextRequest, NextResponse } from 'next/server';
import youtubeService from '@/services/lms/youtubeService';

export async function GET(request: NextRequest) {
  const denied = await requireYoutubeRole(request);
  if (denied) return denied;
  try {
    const state = randomBytes(32).toString("hex");
    const authUrl = youtubeService.getAuthUrl(state);
    
    const response = NextResponse.json({ success: true, authUrl });
    response.cookies.set("bdc_youtube_state", state, { httpOnly: true, secure: (process.env.NEXTAUTH_URL || request.nextUrl.origin).startsWith("https:"), sameSite: "lax", path: "/api/youtube", maxAge: 600 });
    return response;
  } catch {
    console.warn("YouTube operation failed; inspect connection and quota");
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}