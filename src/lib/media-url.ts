/**
 * Normalise stored media URLs (thumbnails, avatars, attachments) into
 * same-origin paths that the app's rewrites/proxies reliably serve.
 *
 * Handles three generations of stored values:
 *   1. "/files/<key>"                      -> already correct
 *   2. "uploads/profiles/<file>"           -> legacy writer missing "/" -> "/uploads/..."
 *   3. "http://old-host/api/v1/files/serve/x" or ".../uploads/x"
 *      -> legacy absolute URLs to internal hosts the browser/container may
 *      not reach -> converted back to their same-origin route.
 * Anything else passes through untouched.
 */
export function resolveMediaUrl(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  if (value.startsWith("/")) return value;

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const serveMarker = "/api/v1/files/serve/";
      const idx = url.pathname.indexOf(serveMarker);
      if (idx !== -1) {
        return "/files/" + url.pathname.slice(idx + serveMarker.length);
      }
      if (url.pathname.startsWith("/uploads/")) return url.pathname;
      return value;
    } catch {
      return null;
    }
  }

  // Bare relative filesystem-style path written by an older uploader.
  return "/" + value.replace(/^\.?\//, "");
}
