import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy handler for /api/files/<filepath>
 * Fetches files from the LMS backend (MinIO via Go service) and streams them back.
 * Resolves browser sessions for embedded media while leaving file authorization
 * with LMS. Browser iframes cannot attach the session's Bearer token themselves.
 */
async function proxyFile(
  request: NextRequest,
  { params }: { params: Promise<{ filepath: string[] }> }
) {
  const { filepath } = await params;
  const segments = filepath.flatMap((segment) => segment.split("/"));
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\\"))) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }
  const filePath = segments.map(encodeURIComponent).join("/");

  const lmsUrl = process.env.LMS_API_URL || "http://lms-service:8081";
  const targetUrl = `${lmsUrl.replace(/\/$/, "")}/api/v1/files/serve/${filePath}`;

  try {
    const headers = new Headers();

    // Forward authorization if present
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("authorization", authHeader);
    } else {
      // iframe/img/video requests carry the NextAuth cookie, not a Bearer header.
      // Resolve the user's token on the server; LMS remains the resource authority.
      const session = await getServerSession(authOptions);
      if (session?.accessToken && !session.error) {
        headers.set("authorization", `Bearer ${session.accessToken}`);
      }
    }

    // PDF viewers use byte ranges and validators to fetch only the pages they
    // need. Preserve those headers through the development/serverless proxy.
    for (const header of ["range", "if-range", "if-none-match", "if-modified-since"]) {
      const value = request.headers.get(header);
      if (value) headers.set(header, value);
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      redirect: "manual",
      cache: "no-store",
      signal: request.signal,
    });

    if (!response.ok && response.status !== 206 && response.status !== 304) {
      return NextResponse.json(
        { error: "File not found" },
        { status: response.status }
      );
    }

    // Stream the response body through
    const responseHeaders = new Headers();

    const headersToForward = [
      "content-type",
      "content-length",
      "content-disposition",
      "content-range",
      "accept-ranges",
      "etag",
      "last-modified",
    ];

    for (const header of headersToForward) {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    responseHeaders.set("Cache-Control", "private, no-store");
    responseHeaders.set("Vary", "Cookie, Authorization");
    responseHeaders.set("X-Content-Type-Options", "nosniff");

    const responseBody = request.method === "HEAD" || response.status === 304
      ? null
      : response.body;

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[files-proxy] Failed to fetch ${targetUrl}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch file from storage" },
      { status: 502 }
    );
  }
}

export const GET = proxyFile;
export const HEAD = proxyFile;
