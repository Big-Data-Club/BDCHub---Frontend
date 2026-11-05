"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { parseTenantPath } from "./paths";

export type TenantBrand = { slug: string; name: string; logo: string };
const TenantContext = createContext<TenantBrand | null>(null);

export function TenantProvider({ initialTenant, children }: { initialTenant: TenantBrand | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = parseTenantPath(pathname)?.slug;
  const [tenant, setTenant] = useState(initialTenant);
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    fetch(`/api/tenant/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(setTenant)
      .catch(() => undefined);
    return () => controller.abort();
  }, [slug, pathname]);
  // Never carry branding into another tenant or the default application.
  return <TenantContext.Provider value={slug && tenant?.slug === slug ? tenant : null}>{children}</TenantContext.Provider>;
}

export function useTenant() { return useContext(TenantContext); }
