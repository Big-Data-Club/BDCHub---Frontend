import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantLanding } from "@/features/tenant-landing/registry";
import { getPublishedSite } from "@/features/tenant-site/server";
import { SiteView } from "@/features/tenant-site/components/SiteView";

type Props = { params: Promise<{ tenantSlug: string; pageSlug: string }> };
export const dynamic = "force-dynamic";
async function resolve({ params }: Props) {
  const { tenantSlug, pageSlug } = await params;
  const brand = await getTenantLanding(tenantSlug);
  if (!brand) notFound();
  const site = await getPublishedSite(tenantSlug);
  const page = site?.pages.find(candidate => candidate.slug === pageSlug);
  if (!site || !page) notFound();
  return { brand, site, page };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { brand, page } = await resolve(props);
  return { title: { absolute: `${page.title} | ${brand.name}` }, alternates: { canonical: `/${brand.slug}/thong-tin/${page.slug}` } };
}
export default async function InformationPage(props: Props) { return <SiteView {...await resolve(props)} />; }
