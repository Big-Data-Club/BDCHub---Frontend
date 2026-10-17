// All game requests use the existing session-authenticated, same-origin BFF.
async function request<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`/api/farm${path}`, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.error ||
        `Không thể tải nông trại (${response.status}). Hãy thử lại.`,
    );
  return data as T;
}
export const api = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, body: object = {}) =>
  request<T>(path, body);
