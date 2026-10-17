import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path?: string[] }> };
async function proxy(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || session.error) {
    return NextResponse.json({ error: "Vui lòng đăng nhập lại." }, { status: 401 });
  }
  const { path = [] } = await context.params;
  const suffix = path.join("/");
  if (req.method === "GET" && suffix === "score") {
    const userId = Number(session.user?.id);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid session identity" }, { status: 401 });
    }
    try {
      const base = process.env.BACKEND_URL || "http://backend:8080";
      const response = await fetch(`${base}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: "no-store", signal: AbortSignal.timeout(5000), redirect: "error",
      });
      if (!response.ok) throw new Error("Score unavailable");
      const user = await response.json();
      if (!Number.isSafeInteger(user.totalScore)) throw new Error("Invalid score");
      return NextResponse.json({ total_score: user.totalScore }, { headers: { "Cache-Control": "no-store" } });
    } catch {
      return NextResponse.json({ error: "Chưa đọc được tổng điểm tài khoản." }, { status: 503 });
    }
  }
  const gameRead = req.method === "GET" && suffix === "game/state";
  const gameWrite = req.method === "POST" && /^game\/(place|move|remove|shop|sell|craft|aid|catch|eat|action|rename|challenge)$/.test(suffix);
  if (!gameRead && !gameWrite && !(req.method === "GET" && !suffix) &&
    !(req.method === "POST" && /^plots\/[1-6]\/(care|challenge|answer)$/.test(suffix))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (req.method === "POST") {
    const expectedOrigin = process.env.NEXTAUTH_URL
      ? new URL(process.env.NEXTAUTH_URL).origin : req.nextUrl.origin;
    if (req.headers.get("origin") !== expectedOrigin || req.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  }
  try {
    let body: string | undefined;
    if (req.method === "POST") {
      // Bound the streamed body even when Content-Length is absent.
      const reader = req.body?.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      if (reader) {
        for (; ;) {
          const { done, value } = await reader.read();
          if (done) break;
          length += value.length;
          if (length > 4096) {
            await reader.cancel();
            return NextResponse.json({ error: "Request too large" }, { status: 413 });
          }
          chunks.push(value);
        }
      }
      body = Buffer.concat(chunks).toString("utf8");
    }
    const base = process.env.FARM_SERVICE_URL || "http://farm-service:8087";
    const response = await fetch(`${base}/api/v1/farm${suffix ? `/${suffix}` : ""}`, {
      method: req.method,
      headers: { Authorization: `Bearer ${session.accessToken}`, "Content-Type": "application/json" },
      body, cache: "no-store", signal: AbortSignal.timeout(12000), redirect: "error",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Chưa kết nối được nông trại. Bạn thử lại sau nhé." }, { status: 503 });
  }
}
export const GET = proxy;
export const POST = proxy;
