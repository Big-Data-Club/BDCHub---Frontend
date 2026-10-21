import { createHash } from "crypto";
import { requireYoutubeRole } from "@/lib/youtube-auth";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const denied = await requireYoutubeRole(request);
  if (denied) return denied;
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get("state");
    if (!state || state !== request.cookies.get("bdc_youtube_state")?.value) {
      return NextResponse.json({ error: "Invalid OAuth state; reconnect from the admin page" }, { status: 403 });
    }
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/lms/admin/youtube-manage?youtube_auth=error&message=${error}`, process.env.NEXTAUTH_URL)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/lms/admin/youtube-manage?youtube_auth=error&message=No code provided', process.env.NEXTAUTH_URL)
      );
    }

    const response = NextResponse.redirect(new URL(`/lms/admin/youtube-manage?youtube_auth=success&code=${encodeURIComponent(code)}`, process.env.NEXTAUTH_URL));
    response.cookies.set("bdc_youtube_state", "", { path: "/api/youtube", maxAge: 0 });
    response.cookies.set("bdc_youtube_code", createHash("sha256").update(code).digest("hex"), { httpOnly: true, secure: (process.env.NEXTAUTH_URL || request.nextUrl.origin).startsWith("https:"), sameSite: "lax", path: "/api/youtube", maxAge: 600 });
    return response;
  } catch (error: any) {
    console.warn("YouTube operation failed; inspect connection and quota");
    return NextResponse.redirect(
      new URL(`/lms/admin/youtube-manage?youtube_auth=error&message=${encodeURIComponent(error.message)}`, process.env.NEXTAUTH_URL)
    );
  }
}