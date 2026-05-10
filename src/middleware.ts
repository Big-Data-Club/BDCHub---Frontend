import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // We only care about proxy paths
  if (
    pathname.startsWith("/apiv1/") ||
    pathname.startsWith("/lmsapiv1/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/files/")
  ) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const requestHeaders = new Headers(req.headers);

    if (token?.accessToken) {
      requestHeaders.set("Authorization", `Bearer ${token.accessToken}`);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/apiv1/:path*",
    "/lmsapiv1/:path*",
    "/uploads/:path*",
    "/files/:path*",
  ],
};
