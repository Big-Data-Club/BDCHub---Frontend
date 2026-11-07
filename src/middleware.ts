import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { parseTenantPath, tenantPath, safeTenantReturnPath } from "@/lib/tenant/paths";

export async function middleware(req: NextRequest) {
  const originalPath = req.nextUrl.pathname;
  const tenant = parseTenantPath(originalPath);
  const pathname = tenant?.path || originalPath;
  const requestHeaders = new Headers(req.headers);
  // Never trust a client-provided tenant context.
  requestHeaders.delete("x-bdc-tenant");
  requestHeaders.delete("x-bdc-return-to");
  requestHeaders.delete("x-bdc-auth-retry");
  if (tenant) requestHeaders.set("x-bdc-tenant", tenant.slug);
  if (pathname === "/login") requestHeaders.set("x-bdc-return-to", safeTenantReturnPath(req.nextUrl.searchParams.get("callbackUrl"), tenant?.slug));
  if (pathname === "/login" && req.nextUrl.searchParams.get("reason") === "session-expired") requestHeaders.set("x-bdc-auth-retry", "1");
  const next = () => tenant && pathname !== "/" && !pathname.startsWith("/thong-tin/")
    ? NextResponse.rewrite(new URL(`${pathname}${req.nextUrl.search}`, req.url), { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
  const login = (expired = false) => {
    const url = new URL(tenantPath("/login", tenant?.slug), req.url);
    url.searchParams.set("callbackUrl", `${originalPath}${req.nextUrl.search}`);
    if (expired) url.searchParams.set("reason", "session-expired");
    return NextResponse.redirect(url);
  };

  // Bypass token check and session lookup for public file paths to optimize performance
  if (
    pathname.startsWith("/files/") ||
    pathname.startsWith("/lmsapiv1/files/serve/") ||
    pathname.startsWith("/lmsapiv1/files/download/")
  ) {
    return next();
  }

  // If authorization header is already present, just pass the request through.
  // This avoids Next.js request-cloning bugs for multipart form-data (uploads).
  if (
    (pathname.startsWith("/apiv1/") ||
      pathname.startsWith("/lmsapiv1/") ||
      pathname.startsWith("/uploads/")) &&
    req.headers.has("Authorization")
  ) {
    return next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-bdc.session-token.v2"
      : "bdc.session-token.v2",
  });

  const publicTenantPath = pathname === "/" || pathname.startsWith("/thong-tin/") || ["/login", "/pending", "/register/google", "/confirm-password-change"].includes(pathname);
  if (tenant && !publicTenantPath) {
    if (!token?.accessToken || token.error === "RefreshAccessTokenError") return login();
    const backend = (process.env.BACKEND_URL || "http://auth-service:8080").replace(/\/$/, "");
    const options = { cache: "no-store" as const, signal: AbortSignal.timeout(10000) };
    try {
      const [orgResponse, memberships] = await Promise.all([
        fetch(`${backend}/api/organizations/slug/${encodeURIComponent(tenant.slug)}`, options),
        fetch(`${backend}/api/organizations/my`, { ...options, headers: { Authorization: `Bearer ${token.accessToken}` } }),
      ]);
      if (orgResponse.status === 404) return new NextResponse("Không tìm thấy tổ chức", { status: 404 });
      if (memberships.status === 401) return login(true);
      if (!orgResponse.ok || !memberships.ok) return new NextResponse("Không thể kiểm tra quyền tổ chức", { status: 503 });
      const org = await orgResponse.json();
      const orgs: { slug: string }[] = await memberships.json();
      if (!org.is_active) return new NextResponse("Không tìm thấy tổ chức", { status: 404 });
      if (!orgs.some(candidate => candidate.slug === tenant.slug)) {
        return new NextResponse("Bạn chưa được cấp quyền truy cập tổ chức này", { status: 403 });
      }
    } catch {
      return new NextResponse("Không thể kiểm tra quyền tổ chức", { status: 503 });
    }
  }

  // Preserve a deep LMS link across login. The client route guard will then
  // verify the user's actual LMS role before rendering the destination.
  if (pathname === "/lms" || pathname.startsWith("/lms/")) {
    if (!token || !token.accessToken || (token as any).error === "RefreshAccessTokenError") {
      const loginUrl = new URL(tenantPath("/login", tenant?.slug), req.url);
      loginUrl.searchParams.set("callbackUrl", `${originalPath}${req.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
    return next();
  }

  // We only care about proxy paths
  if (
    pathname.startsWith("/apiv1/") ||
    pathname.startsWith("/lmsapiv1/") ||
    pathname.startsWith("/uploads/")
  ) {

    if (token?.accessToken) {
      requestHeaders.set("Authorization", `Bearer ${token.accessToken}`);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return next();
  }

  // Check admin-only paths
  const adminPaths = [
    "/dashboard",
    "/users",
    "/events",
    "/tasks",
    "/leaderboard",
    "/settings",
  ];

  const isAdminPath = adminPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isAdminPath) {
    if (!token) {
      return login();
    }

    if (token.role !== "ROLE_ADMIN") {
      return NextResponse.redirect(new URL(tenantPath("/lms", tenant?.slug), req.url));
    }
  }

  return next();
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$).*)"],
};
