import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextResponse } from "next/server";

const DUTYLOG_URL = process.env.DUTYLOG_SERVICE_URL || "http://dutylog-service:8086";
const AUTH_URL = process.env.BACKEND_URL || "http://backend:8080";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Try to fetch from dutylog-service (includes local room count)
  try {
    const res = await fetch(`${DUTYLOG_URL}/api/v1/organizations`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.organizations) && data.organizations.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch organizations from dutylog-service, fallback to auth-service:", err);
  }

  // 2. Fallback to auth-and-management-service if dutylog has not synced yet
  try {
    const authRes = await fetch(`${AUTH_URL}/api/organizations`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    });
    if (authRes.ok) {
      const authOrgs = await authRes.json();
      const orgs = (Array.isArray(authOrgs) ? authOrgs : []).map((o: any) => ({
        id: o.id,
        slug: o.slug,
        name: o.name,
        description: o.description || "",
        is_active: o.is_active ?? true,
        room_count: 0,
      }));
      return NextResponse.json({ organizations: orgs });
    }
  } catch (err) {
    console.error("Failed to fetch fallback organizations from auth-service:", err);
  }

  return NextResponse.json({ organizations: [] });
}
