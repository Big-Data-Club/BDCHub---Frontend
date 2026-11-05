import "server-only";
import { cache } from "react";
import type { SiteDocument } from "./types";

export const getPublishedSite = cache(async (slug: string): Promise<SiteDocument | null> => {
  const base = (process.env.BACKEND_URL || "http://auth-service:8080").replace(/\/$/, "");
  const response = await fetch(`${base}/api/tenant-sites/${encodeURIComponent(slug)}`, { next: { revalidate: 30 }, signal: AbortSignal.timeout(10000) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Tenant site unavailable (${response.status})`);
  const result: { document: SiteDocument } = await response.json();
  return result.document;
});
