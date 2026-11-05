// UI routes only. API, uploads, static files and WebSockets stay at the origin root.
export const tenantRouteRoots = new Set([
  "lms", "knowledge-farm", "chat", "labs", "myaccount", "guide",
  "dashboard", "users", "events", "tasks", "leaderboard", "settings",
  "login", "pending", "register", "confirm-password-change",
]);
const reservedRoots = new Set([
  ...tenantRouteRoots, "api", "apiv1", "lmsapiv1", "labapiv1", "chatapiv1",
  "uploads", "files", "_next", "partner", "personalize", "recommender",
  "hpc-summer-school", "hackathon2025", "bdc-hub", "instructions", "forms",
  "recruitment-2026", "bdc-recruitment-2026", "tuyen-thanh-vien-2026",
  "big-data-day-2026", "danh-gia-dr-mt23khm3-hk252",
]);

export function parseTenantPath(pathname: string): { slug: string; path: string } | null {
  const [slug, ...rest] = pathname.split("/").slice(1);
  if (!slug || reservedRoots.has(slug) || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(slug)) return null;
  if (rest.length && rest[0] && !tenantRouteRoots.has(rest[0])) return null;
  return { slug, path: rest.length && rest[0] ? `/${rest.join("/")}` : "/" };
}

export function tenantPath(href: string, slug?: string): string {
  if (!slug || !href.startsWith("/") || href.startsWith("//") || href.includes("\\")) return href;
  if (href === "/") return `/${slug}`;
  const root = href.slice(1).split(/[/?#]/)[0];
  return tenantRouteRoots.has(root) ? `/${slug}${href}` : href;
}

export function safeTenantReturnPath(value: string | null | undefined, slug?: string): string {
  const fallback = tenantPath("/lms", slug);
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return fallback;
  const parsed = new URL(value, "https://bdc.local");
  if (parsed.origin !== "https://bdc.local") return fallback;
  const tenant = parseTenantPath(parsed.pathname);
  if (tenant && tenant.slug !== slug) return fallback;
  const path = tenant?.path || parsed.pathname;
  const root = path.slice(1).split("/")[0];
  if (!tenantRouteRoots.has(root) || ["login", "pending", "register", "confirm-password-change"].includes(root)) return fallback;
  return tenantPath(`${path}${parsed.search}${parsed.hash}`, slug);
}
