import { getAccessToken } from "../auth/authToken";
import { handleUnauthorized } from "../auth/unauthorized";
import { ApiError } from "./apiError";

export type RequestOptions = Pick<RequestInit, "signal">;

export class ApiClient {
  constructor(readonly baseURL: string) {}

  private async request<T>(
    endpoint: string,
    init: RequestInit,
    responseType: "json" | "void" = "json",
  ): Promise<T> {
    init.signal?.throwIfAborted();
    const token = await getAccessToken();
    init.signal?.throwIfAborted();
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...init,
      headers,
      credentials: "include",
    });
    if (response.status === 401) {
      await handleUnauthorized().catch(() => undefined);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new ApiError(
        `Request to ${endpoint} failed (${response.status})${text ? `: ${text}` : ""}`,
        response.status,
        endpoint,
      );
    }
    if (responseType === "void" || response.status === 204)
      return undefined as T;
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError(
        `Invalid JSON response from ${endpoint}`,
        response.status,
        endpoint,
        "INVALID_RESPONSE",
      );
    }
  }

  get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  private json<T>(
    method: string,
    endpoint: string,
    data: unknown,
    options: RequestOptions,
  ): Promise<T> {
    return this.request(endpoint, {
      ...options,
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  post<T>(
    endpoint: string,
    data: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.json("POST", endpoint, data, options);
  }

  patch<T>(
    endpoint: string,
    data: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.json("PATCH", endpoint, data, options);
  }

  put<T>(
    endpoint: string,
    data: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.json("PUT", endpoint, data, options);
  }

  delete(endpoint: string, options: RequestOptions = {}): Promise<void> {
    return this.request(endpoint, { ...options, method: "DELETE" }, "void");
  }

  uploadFile<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {},
  ): Promise<T> {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  }
}

export const apiClient = new ApiClient("/apiv1");
