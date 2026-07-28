"use client";

import { signOut } from "next-auth/react";
import { clearAccessTokenCache } from "./authToken";

/** Clear every browser-side auth artifact before navigating to login. */
export async function logout() {
  clearAccessTokenCache();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("lms_selected_role");
    sessionStorage.removeItem("lms_role_selected_at");
    localStorage.removeItem("currentUser");
    await fetch("/api/session/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
  }

  await signOut({ redirect: false });
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}
