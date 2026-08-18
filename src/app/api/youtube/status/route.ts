import { NextRequest, NextResponse } from 'next/server';
import youtubeTokenManager from '@/services/lms/youtubeTokenManager';

export async function GET(request: NextRequest) {
  try {
    const status = await youtubeTokenManager.getStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('YouTube status error:', error);
    return NextResponse.json(
      { 
        connected: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}