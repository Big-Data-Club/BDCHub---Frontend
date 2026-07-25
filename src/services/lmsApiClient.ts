import axios from "axios";
import { getAccessToken, clearAccessTokenCache } from "./authToken";

export const lmsApiClient = axios.create({
  baseURL: "/lmsapiv1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

lmsApiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Prevent GET requests from being cached by intermediate proxies or the browser
  if (config.method?.toLowerCase() === "get") {
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";
  }
  return config;
});

// ── Handle 401 → clear cache & sign out ─────────────────────────────────
lmsApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAccessTokenCache();
      try {
        const { lmsService } = await import("./lmsService");
        lmsService.clearRolesCache();
      } catch (e) {
        console.error("Failed to clear roles cache:", e);
      }
      const { signOut } = await import("next-auth/react");
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/login" });
      }
    }
    return Promise.reject(error);
  }
);