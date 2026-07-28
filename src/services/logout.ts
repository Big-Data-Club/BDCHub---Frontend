"use client";

import { signOut } from "next-auth/react";
import { clearAccessTokenCache } from "./authToken";

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
      localStorage.removeItem("currentUser");
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
      window.location.replace("/login");
    } else {
      isLoggingOut = false;
    }
  }
}
