/** Client-side helpers for secure LMS deep links. */

export type LmsRole = "ADMIN" | "TEACHER" | "STUDENT";

export function hasLmsRole(roles: string[] | null | undefined, role: LmsRole): boolean {
  return (roles || []).some((candidate) => candidate === role || candidate === `ROLE_${role}`);
}

export function activateLmsRole(role: LmsRole): void {
  sessionStorage.setItem("lms_selected_role", role);
  sessionStorage.setItem("lms_role_selected_at", new Date().toISOString());
}

/** Accept only internal LMS paths; never let a login parameter create an open redirect. */
export function safeLmsReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/lms";
  const parsed = new URL(value, "https://bdc.local");
  return parsed.pathname === "/lms" || parsed.pathname.startsWith("/lms/")
    ? `${parsed.pathname}${parsed.search}`
    : "/lms";
}
