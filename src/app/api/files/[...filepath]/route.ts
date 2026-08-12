import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy handler for /api/files/<filepath>
 * Fetches files from the LMS backend (MinIO via Go service) and streams them back.
 * This is needed because Vercel's next.config rewrites don't reliably proxy
 * to external HTTP backends in production (standalone output).
 */
async function proxyFile(
  request: NextRequest,
  { params }: { params: Promise<{ filepath: string[] }> }
) {
  const { filepath } = await params;
  const filePath = filepath.join("/");

  const lmsUrl = process.env.LMS_API_URL || "http://lms-backend:8081";
  const targetUrl = `${lmsUrl}/api/v1/files/serve/${filePath}`;

  try {
    const headers = new Headers();

    // Forward authorization if present
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("authorization", authHeader);
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

    // Files are immutable (timestamped filenames)
    responseHeaders.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
    responseHeaders.set("Access-Control-Allow-Origin", "*");

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
