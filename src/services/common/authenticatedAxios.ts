import { CanceledError, type AxiosInstance } from "axios";
import { getAccessToken } from "../auth/authToken";
import { handleUnauthorized } from "../auth/unauthorized";

export function authenticateAxios(
  client: AxiosInstance,
  options: { disableGetCache?: boolean } = {},
) {
  client.interceptors.request.use(async (config) => {
    if (config.signal?.aborted) throw new CanceledError();
    const token = await getAccessToken();
    if (config.signal?.aborted) throw new CanceledError();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (options.disableGetCache && config.method?.toLowerCase() === "get") {
      config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
      config.headers.Pragma = "no-cache";
      config.headers.Expires = "0";
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error.response as { status?: number } | undefined)?.status === 401
      ) {
        // A failed logout must never turn a failed mutation into success.
        await handleUnauthorized().catch(() => undefined);
      }
      return Promise.reject(error);
    },
  );
  return client;
}
