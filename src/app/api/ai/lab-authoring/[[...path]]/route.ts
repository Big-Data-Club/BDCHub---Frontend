import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

async function forward(req: NextRequest, path: string[] = []) {
  const session = await getServerSession(authOptions);
  const owner = Number(session?.user?.id || 0);
  const role = String(session?.user?.role || "").replace(/^ROLE_/, "");
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN", "TEACHER"].includes(role)) return NextResponse.json({ error: "Author permission required" }, { status: 403 });
  if (path.length > 1 || (path.length === 1 && !/^[0-9a-f-]{36}$/i.test(path[0]))) return NextResponse.json({ error: "Invalid job" }, { status: 400 });
  const secret = process.env.AI_SERVICE_SECRET;
  if (!secret) return NextResponse.json({ error: "AI service is not configured" }, { status: 503 });
  try {
    let body: string | undefined;
    if (req.method === "POST") {
      if (path.length) return NextResponse.json({ error: "Invalid route" }, { status: 404 });
      const raw = await req.text();
      if (new TextEncoder().encode(raw).length > 150000) return NextResponse.json({ error: "Draft too large" }, { status: 413 });
      const payload = JSON.parse(raw);
      // Never accept an owner identifier from the browser.
      body = JSON.stringify({ task: payload.task, lab_type: payload.lab_type, instruction: payload.instruction, source: payload.source, count: payload.count, owner_id: owner });
    } else if (!path.length) return NextResponse.json({ error: "Job required" }, { status: 400 });
    const response = await fetch(`${process.env.AI_SERVICE_URL || "http://ai-service:8000"}/ai/lab-authoring${path.length ? `/${path[0]}?owner_id=${owner}` : ""}`, {
      method: req.method, body, headers: { "Content-Type": "application/json", "X-AI-Secret": secret }, cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ error: "Unable to request AI draft" }, { status: 502 });
  }
}
export function POST(req: NextRequest, { params }: { params: { path?: string[] } }) { return forward(req, params.path); }
export function GET(req: NextRequest, { params }: { params: { path?: string[] } }) { return forward(req, params.path); }
