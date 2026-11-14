/** Browser-only, generation-scoped session token cache shared by API clients. */
let cachedToken: string | null = null;
let tokenFetchedAt = 0;
let generation = 0;
let inFlight: Promise<string | null> | null = null;
const TOKEN_CACHE_MS = 5 * 60 * 1000;
const invalidationListeners = new Set<() => void>();

export function subscribeAuthInvalidation(listener: () => void): () => void {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
}

export function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (cachedToken && Date.now() - tokenFetchedAt < TOKEN_CACHE_MS)
    return Promise.resolve(cachedToken);
  if (inFlight) return inFlight;
  const owner = generation;
  const pending = (async () => {
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      if (owner !== generation) return null;
      cachedToken = session?.error ? null : (session?.accessToken ?? null);
      tokenFetchedAt = Date.now();
      return cachedToken;
    } catch {
      // Never reuse an expired token after a failed session refresh.
      return null;
    }
  })();
  inFlight = pending;
  void pending.finally(() => {
    if (inFlight === pending) inFlight = null;
  });
  return pending;
}

export function clearAccessTokenCache(): void {
  generation++;
  cachedToken = null;
  tokenFetchedAt = 0;
  inFlight = null;
  invalidationListeners.forEach((listener) => listener());
}
