import { requireYoutubeRole } from "@/lib/youtube-auth";
import { NextRequest, NextResponse } from 'next/server';
import youtubeTokenManager from '@/services/lms/youtubeTokenManager';

export async function POST(request: NextRequest) {
  const denied = await requireYoutubeRole(request);
  if (denied) return denied;
  try {
    await youtubeTokenManager.deleteTokens();

    return NextResponse.json({
      success: true,
      message: 'YouTube disconnected successfully',
    });
  } catch {
    console.warn("YouTube operation failed; inspect connection and quota");
    return NextResponse.json(
      { error: 'Failed to disconnect shared YouTube channel' },
      { status: 500 }
    );
  }
}