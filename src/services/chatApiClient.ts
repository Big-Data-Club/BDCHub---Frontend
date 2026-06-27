import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// chatApiClient is an axios instance targeting the chat-service.
// In dev: Next.js rewrites /chatapiv1/* → http://localhost:8083/api/v1/*
// In prod: Traefik routes /chatapiv1/* → chat-backend:8083/api/v1/*

const chatApiClient = axios.create({
  baseURL: "/chatapiv1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Inject Bearer token from NextAuth session on every request
chatApiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  const token = (session as any)?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear session and redirect to login
chatApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  }
);

export default chatApiClient;
