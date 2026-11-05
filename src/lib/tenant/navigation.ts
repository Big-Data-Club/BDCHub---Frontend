"use client";

import { useMemo } from "react";
import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";
import { parseTenantPath, tenantPath } from "./paths";
export { useSearchParams, useParams, useSelectedLayoutSegment, useSelectedLayoutSegments, notFound, redirect } from "next/navigation";

// Existing screens continue comparing canonical /lms/... paths.
export function usePathname() {
  const pathname = useNextPathname();
  return parseTenantPath(pathname)?.path || pathname;
}

export function useRouter() {
  const router = useNextRouter();
  const slug = parseTenantPath(useNextPathname())?.slug;
  return useMemo(() => ({
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(tenantPath(href, slug), options),
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(tenantPath(href, slug), options),
    prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => router.prefetch(tenantPath(href, slug), options),
  }), [router, slug]);
}
