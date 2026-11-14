"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/lib/tenant/navigation";
import { getSelectedLmsRole, type LmsRole } from "@/lib/lms-navigation";

/** Navigation preference is restored after hydration, never during render. */
export function useSelectedLmsRole() {
  const pathname = usePathname();
  const [role, setRole] = useState<LmsRole | null>(null);
  useEffect(() => {
    try {
      setRole(getSelectedLmsRole());
    } catch {
      setRole(null);
    }
  }, [pathname]);
  return role;
}
