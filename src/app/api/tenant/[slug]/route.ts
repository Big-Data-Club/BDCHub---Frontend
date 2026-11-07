import { NextResponse } from "next/server";
import { getTenantLanding } from "@/features/tenant-landing/registry";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const tenant = await getTenantLanding((await params).slug);
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ slug: tenant.slug, name: tenant.name, logo: tenant.logo }, { headers: { "Cache-Control": "no-store" } });
}
