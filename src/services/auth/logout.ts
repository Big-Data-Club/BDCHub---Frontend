"use client";

import { signOut } from "next-auth/react";
import { clearAccessTokenCache } from "./authToken";
import { parseTenantPath, tenantPath } from "@/lib/tenant/paths";

let isLoggingOut = false;

/** Clear every browser-side auth artifact before navigating to login. Safe against rapid parallel calls. */
export async function logout() {
  if (isLoggingOut) return;
  isLoggingOut = true;

  clearAccessTokenCache();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("lms_selected_role");
      sessionStorage.removeItem("lms_role_selected_at");
      sessionStorage.removeItem("lms_user_roles");
      localStorage.removeItem("currentUser");
      try {
        const { lmsService } = await import("../lms/lmsService");
        lmsService.clearRolesCache();
      } catch {}
      await fetch("/api/session/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    } catch (e) {
      console.error("Failed clearing local session storage:", e);
    }
  }

  try {
    await signOut({ redirect: false });
  } catch (e) {
    console.error("SignOut error:", e);
  } finally {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace(tenantPath("/login", parseTenantPath(window.location.pathname)?.slug));
    } else {
      isLoggingOut = false;
    }
  }
}
