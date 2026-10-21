import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/request-origin";

export async function requireYoutubeRole(request: NextRequest, roles = ["ADMIN"]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = String(session.user.role || "").replace(/^ROLE_/, "").toUpperCase();
  if (!roles.includes(role)) return NextResponse.json({ error: "Permission required" }, { status: 403 });
  if (request.method !== "GET" && !isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  return null;
}
