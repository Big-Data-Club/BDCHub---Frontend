import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;
  if (!session?.user || !token) return new Response(null, { status: 401 });
  const controller = new AbortController();
  const headerTimeout = setTimeout(() => controller.abort(), 4000);
  try {
    const upstream = await fetch(`${process.env.LMS_API_URL || "http://lms-service:8081"}/api/v1/notifications/stream`, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.any([req.signal, controller.signal]), cache: "no-store",
    });
    if (!upstream.ok || !upstream.body) return new Response(null, { status: upstream.status === 401 ? 401 : 503 });
    return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
  } catch { return new Response(null, { status: 503 }); }
  finally { clearTimeout(headerTimeout); }
}
