import axios from "axios";
import { getAccessToken, clearAccessTokenCache } from "./authToken";

export const latexApiClient = axios.create({
  baseURL: "/latexapiv1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Inject Bearer token
latexApiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized
latexApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAccessTokenCache();
      const { signOut } = await import("next-auth/react");
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/login" });
      }
    }
    return Promise.reject(error);
  }
);
