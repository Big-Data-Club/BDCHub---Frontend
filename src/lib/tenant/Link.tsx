"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { parseTenantPath, tenantPath } from "./paths";

const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function TenantLink({ href, ...props }, ref) {
  const slug = parseTenantPath(usePathname())?.slug;
  const target = typeof href === "string" ? tenantPath(href, slug) : {
    ...href, pathname: href.pathname ? tenantPath(href.pathname, slug) : href.pathname,
  };
  return <NextLink {...props} href={target} ref={ref} />;
});
export default Link;
