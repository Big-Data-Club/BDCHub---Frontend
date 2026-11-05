import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TenantLanding } from "@/features/tenant-landing/TenantLanding";
import { getTenantLanding, getTenantSlugs } from "@/features/tenant-landing/registry";

type Props = { params: Promise<{ tenantSlug: string }> };

// Only explicitly registered tenants are public; existing static routes win.
export const dynamicParams = false;

export function generateStaticParams() {
  return getTenantSlugs().map((tenantSlug) => ({ tenantSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = getTenantLanding((await params).tenantSlug);
  if (!tenant) notFound();
  return {
    title: { absolute: tenant.name },
    description: tenant.description,
    keywords: [tenant.name, tenant.shortName],
    alternates: { canonical: `/${tenant.slug}` },
    openGraph: {
      title: tenant.name,
      description: tenant.description,
      url: `/${tenant.slug}`,
      siteName: tenant.name,
      images: [{ url: tenant.logo, alt: tenant.name }],
      locale: "vi_VN",
      type: "website",
    },
    twitter: { card: "summary", title: tenant.name, description: tenant.description, images: [tenant.logo] },
  };
}

export default async function TenantPage({ params }: Props) {
  const tenant = getTenantLanding((await params).tenantSlug);
  if (!tenant) notFound();
  return <TenantLanding tenant={tenant} />;
}
