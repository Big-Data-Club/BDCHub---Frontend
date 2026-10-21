import { requireYoutubeRole } from "@/lib/youtube-auth";
import { NextRequest, NextResponse } from 'next/server';
import youtubeTokenManager from '@/services/lms/youtubeTokenManager';

export async function GET(request: NextRequest) {
  const denied = await requireYoutubeRole(request);
  if (denied) return denied;
  try {
    const status = await youtubeTokenManager.getStatus();
    return NextResponse.json(status);
  } catch {
    console.warn("YouTube operation failed; inspect connection and quota");
    return NextResponse.json(
      {
        connected: false,
        error: "Shared YouTube connection unavailable"
      },
      { status: 500 }
    );
  }
}
