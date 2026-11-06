import { readableTasks } from "@/features/workspace/api/linkedTasks.server";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const allowed = new RegExp(
  `^(bootstrap|tab-pages|me|spaces|spaces/${uuid}/(pages|members|fields)|fields/${uuid}(/(archive|restore))?|pages/${uuid}/blocks/[a-zA-Z0-9_-]{1,100}/activity|search|pages/${uuid}(/(archive|restore|duplicate|favorite|document|ticket|initialize|versions|sharing|comments|files|activity|view|analytics|references|ai|tasks))?|pages/${uuid}/versions/${uuid}/restore|invitations|invitations/${uuid}(/respond)?|grants|comments/${uuid}|databases/${uuid}(/(schema|records|views))?|databases/${uuid}/views/${uuid}|records/${uuid}|files/${uuid}|legacy-notes|notifications|notifications/${uuid}/read)$`,
);

async function readBody(req: NextRequest, limit: number) {
  const reader = req.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error("body_limit");
    }
    parts.push(value);
  }
  return Buffer.concat(parts);
}
async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.accessToken || session.error)
    return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  const path = (await params).path?.join("/") || "";
  if (!allowed.test(path))
    return NextResponse.json({ error: "Không tìm thấy." }, { status: 404 });
  if (!["GET", "HEAD"].includes(req.method)) {
    const origin = process.env.NEXTAUTH_URL
      ? new URL(process.env.NEXTAUTH_URL).origin
      : req.nextUrl.origin;
    if (
      req.headers.get("origin") !== origin ||
      req.headers.get("sec-fetch-site") === "cross-site"
    )
      return NextResponse.json(
        { error: "Nguồn yêu cầu không hợp lệ." },
        { status: 403 },
      );
  }
  const service =
    process.env.WORKSPACE_SERVICE_URL || "http://workspace-service:8088";
  const authHeaders = { Authorization: `Bearer ${session.accessToken}` };
  const upstream = (suffix: string, init: RequestInit = {}) =>
    fetch(`${service}/api/v1/workspace/${suffix}`, {
      ...init,
      headers: { ...authHeaders, ...init.headers },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20000),
    });
  try {
    if (path === "bootstrap" && req.method === "GET" && session.user.name) {
      const updated = await upstream("me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: session.user.name.slice(0, 100) }),
      });
      if (!updated.ok)
        return new NextResponse(await updated.text(), {
          status: updated.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
    }
    if (path === "legacy-notes") {
      const ai = process.env.AI_SERVICE_URL || "http://ai-service:8000";
      const response = await fetch(
        `${ai}/ai/agents/notebook?user_id=${encodeURIComponent(String(session.user.id))}`,
        {
          headers: { "X-AI-Secret": process.env.AI_SERVICE_SECRET || "" },
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!response.ok)
        return NextResponse.json(
          { error: "Chưa tải được Vở ghi hiện tại." },
          { status: response.status },
        );
      const data = (await response.json()) as {
        notes?: {
          id: string;
          title: string;
          content: string;
          course_id?: number;
        }[];
      };
      if (req.method === "GET") return NextResponse.json(data.notes || []);
      if (req.method !== "POST")
        return NextResponse.json(
          { error: "Thao tác không hợp lệ." },
          { status: 405 },
        );
      const input = JSON.parse((await readBody(req, 4096)).toString()) as {
        note_id?: string;
      };
      const note = data.notes?.find((item) => item.id === input.note_id);
      if (!note)
        return NextResponse.json(
          { error: "Không tìm thấy ghi chú của bạn." },
          { status: 404 },
        );
      const saved = await upstream("legacy-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note_id: note.id,
          title: note.title,
          content: note.content,
          course_id: note.course_id || null,
        }),
      });
      return new NextResponse(await saved.text(), {
        status: saved.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }
    if (path.endsWith("/tasks") && req.method === "GET") {
      const permitted = await upstream(path.slice(0, -6));
      if (!permitted.ok)
        return NextResponse.json(
          { error: "Bạn chưa có quyền đọc trang." },
          { status: permitted.status },
        );
      return NextResponse.json(await readableTasks(session), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    if (path.endsWith("/ai") && req.method === "POST") {
      const pagePath = path.slice(0, -3);
      const permitted = await upstream(pagePath);
      if (!permitted.ok)
        return NextResponse.json(
          { error: "Bạn chưa có quyền đọc trang." },
          { status: permitted.status },
        );
      const page = (await permitted.json()) as {
        title: string;
        search_text?: string;
        sources: { type: string; id?: string }[];
      };
      const document = await upstream(`${pagePath}/document`);
      if (!document.ok)
        return NextResponse.json(
          { error: "Chưa đọc được trang." },
          { status: document.status },
        );
      // The server-owned text projection is fetched only after the page access check.
      const input = JSON.parse((await readBody(req, 50000)).toString()) as {
        prompt?: string;
        selection?: string;
      };
      if (
        !input.prompt?.trim() ||
        input.prompt.length > 2000 ||
        (input.selection?.length || 0) > 30000
      )
        return NextResponse.json(
          { error: "Nội dung yêu cầu quá dài hoặc trống." },
          { status: 400 },
        );
      const course = page.sources.find(
        (source) => source.type === "course" && /^\d+$/.test(source.id || ""),
      );
      const response = await fetch(
        `${process.env.AI_SERVICE_URL || "http://ai-service:8000"}/ai/agents/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AI-Secret": process.env.AI_SERVICE_SECRET || "",
          },
          body: JSON.stringify({
            user_id: Number(session.user.id),
            agent_type: "mentor",
            chat_mode: "flash",
            ...(course ? { course_id: Number(course.id) } : {}),
            message: `${input.prompt}\n\nTài liệu tham khảo do người dùng chọn (${page.title}):\n${input.selection || String(page.search_text || "").slice(0, 30000)}`,
            user_context: { name: session.user.name },
            page_context: { type: "workspace", title: page.title },
          }),
          signal: req.signal,
        },
      );
      if (!response.ok)
        return NextResponse.json(
          { error: "AI chưa thể trả lời. Vui lòng thử lại." },
          { status: response.status },
        );
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }
    const upload = path.endsWith("/files") && req.method === "POST";
    const bytes = ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await readBody(req, upload ? 10485760 : 2097152);
    const response = await upstream(`${path}${req.nextUrl.search}`, {
      method: req.method,
      headers: {
        "Content-Type": upload
          ? "application/octet-stream"
          : "application/json",
        ...(upload
          ? {
              "X-File-Name": req.headers.get("x-file-name") || "attachment",
            }
          : {}),
      },
      body: bytes,
    });
    const headers = new Headers({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    for (const key of [
      "content-type",
      "content-disposition",
      "content-security-policy",
    ]) {
      const value = response.headers.get(key);
      if (value) headers.set(key, value);
    }
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    const limited = error instanceof Error && error.message === "body_limit";
    return NextResponse.json(
      {
        error: limited
          ? "Nội dung vượt giới hạn dung lượng."
          : "Chưa kết nối được Workspace. Bạn có thể thử lại.",
      },
      { status: limited ? 413 : 503 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
