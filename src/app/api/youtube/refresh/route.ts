import { requireYoutubeRole } from "@/lib/youtube-auth";
import { NextRequest, NextResponse } from 'next/server';
import youtubeTokenManager from '@/services/lms/youtubeTokenManager';

export async function POST(request: NextRequest) {
  const denied = await requireYoutubeRole(request);
  if (denied) return denied;
  try {
    await youtubeTokenManager.refreshTokens();

    return NextResponse.json({
      success: true,
      message: 'YouTube tokens refreshed successfully',
    });
  } catch {
    console.warn("YouTube operation failed; inspect connection and quota");
    return NextResponse.json(
      { error: 'Failed to refresh shared YouTube channel' },
      { status: 500 }
    );
  }
}