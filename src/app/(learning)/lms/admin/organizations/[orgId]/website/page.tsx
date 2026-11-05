import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { SiteEditor } from "@/features/tenant-site/editor/SiteEditor";
import { tenantRedirect } from "@/lib/tenant/server";
import type { Organization } from "@/types/admin/organization";

export default async function WebsiteEditorPage({ params }: { params: Promise<{ orgId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ROLE_ADMIN") await tenantRedirect("/lms");
  const id = Number((await params).orgId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const base = (process.env.BACKEND_URL || "http://auth-service:8080").replace(/\/$/, "");
  const response = await fetch(`${base}/api/organizations/${id}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Không thể tải tổ chức");
  const org: Organization = await response.json();
  return <SiteEditor orgId={id} brand={{ slug: org.slug, name: org.name, logo: org.logo_url || "" }} />;
}
