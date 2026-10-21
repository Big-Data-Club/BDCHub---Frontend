import { timingSafeEqual } from "crypto";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import youtubeTokenManager from "@/services/lms/youtubeTokenManager";

export const runtime = "nodejs";

/** Worker-only bridge to the admin-managed shared channel. Never exposed by a BFF proxy. */
export async function POST(request: NextRequest) {
  const expected = process.env.AI_SERVICE_SECRET || "";
  const supplied = request.headers.get("X-AI-Secret") || "";
  if (!expected || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const headers = { "Cache-Control": "no-store" };
  try {
    const { action, channel_id: channelId, video_id: videoId } = await request.json();
    const enabled = process.env.NEXT_PUBLIC_YOUTUBE_UPLOAD_ENABLED === "true";
    const connected = enabled && await youtubeTokenManager.hasValidTokens();
    const status = await youtubeTokenManager.getStatus();
    if (action === "status") {
      return NextResponse.json({ enabled, connected, channel_id: status.channel_id || null,
        channel_title: status.channel_name || null, destination: "shared_system_channel" }, { headers });
    }
    if (!connected) return NextResponse.json({ error: "Shared channel unavailable" }, { status: 503, headers });
    const auth = await youtubeTokenManager.getAuthenticatedClient();
    const youtube = google.youtube({ version: "v3", auth });
    if (action === "token") {
      if (!channelId || channelId !== status.channel_id) {
        return NextResponse.json({ error: "Shared channel changed" }, { status: 409, headers });
      }
      // Verify the live OAuth principal before any external upload, including after reconnect.
      const channels = await youtube.channels.list({ part: ["id"], mine: true });
      if (!channels.data.items?.some(item => item.id === channelId)) {
        return NextResponse.json({ error: "OAuth channel mismatch" }, { status: 409, headers });
      }
      const token = await auth.getAccessToken();
      if (!token.token) throw new Error("No access token");
      return NextResponse.json({ access_token: token.token }, { headers });
    }
    if (action === "video" && typeof videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      const response = await youtube.videos.list({ part: ["snippet", "status"], id: [videoId] });
      const video = response.data.items?.[0];
      if (!video || video.snippet?.channelId !== status.channel_id) {
        return NextResponse.json({ error: "Video not on shared channel" }, { status: 404, headers });
      }
      return NextResponse.json({ channel_id: video.snippet?.channelId, privacy: video.status?.privacyStatus,
        upload_status: video.status?.uploadStatus }, { headers });
    }
    return NextResponse.json({ error: "Unsupported action" }, { status: 400, headers });
  } catch {
    // OAuth errors can include credentials. Return only an operational message.
    return NextResponse.json({ error: "Check the admin YouTube connection and channel quota" }, { status: 503, headers });
  }
}
