"use client";

import Image from "next/image";
import { LogoIcon } from "@/constants";
import { useTenant } from "@/lib/tenant/context";

export function BrandMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  const tenant = useTenant();
  if (tenant && !tenant.logo) {
    return <span role="img" aria-label={tenant.name} style={{ width: size, height: size }} className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 font-bold ${className}`}>{tenant.name.charAt(0)}</span>;
  }
  return <Image src={tenant?.logo || LogoIcon} alt={tenant?.name || "Big Data Club"} width={size} height={size} priority className={`shrink-0 object-contain ${tenant ? "rounded-full bg-white" : ""} ${className}`} />;
}
