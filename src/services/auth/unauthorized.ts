import { clearAccessTokenCache } from "./authToken";

/** Auth policy shared by transports; domain cache cleanup subscribes to invalidation. */
export async function handleUnauthorized(): Promise<void> {
  clearAccessTokenCache();
  if (typeof window !== "undefined") {
    const { logout } = await import("./logout");
    await logout();
  }
}
