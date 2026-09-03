import { User } from "@/types";
import { v4 as uuidv4 } from "uuid";

/** Convert server user object to frontend User */
export function humanizeEnum(value?: string) {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.startsWith("role_")) {
    return value.replace(/^ROLE_?/i, "").toLowerCase().replace(/(^|\_)([a-z])/g, (_, __, c) => c.toUpperCase());
  }
  return value.toLowerCase().replace(/(^|\_)([a-z])/g, (_, __, c) => c.toUpperCase());
}

/** Safely convert a server date value (ISO string or epoch seconds) to an ISO string */
function parseServerDate(value: string | number | null | undefined): string {
  if (!value) return new Date().toISOString();
  // If it's a number, treat as epoch milliseconds (> 1e10) or epoch seconds (< 1e10)
  if (typeof value === "number") {
    const ms = value > 1e10 ? value : value * 1000;
    return new Date(ms).toISOString();
  }
  // If ISO string with time component, use as-is
  if (typeof value === "string" && value.includes("T")) {
    return value;
  }
  // Date-only string like "2026-09-03" → append time to avoid UTC midnight shifting
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00`;
  }
  return new Date(value).toISOString();
}

export function mapServerUserToClient(s: any): User {
  return {
    id: String(s.id ?? uuidv4()),
    name: s.name ?? s.fullName ?? "Unnamed",
    code: (s.code ?? s.email ?? `user-${s.id}`) as string,
    email: s.email ?? "",
    team: humanizeEnum(s.team) || "Research",
    type: (s.type ?? "CLC") as string,
    role: s.role || "ROLE_USER",
    roles: Array.isArray(s.roles) ? s.roles : (s.role ? [s.role] : ["ROLE_USER"]),
    lmsRoles: Array.isArray(s.lmsRoles) ? s.lmsRoles : [],
    score: Number(s.totalScore ?? s.score ?? 0),
    dateAdded: parseServerDate(s.createdAt ?? s.updatedAt),
    status: typeof s.active === "boolean" ? s.active : Boolean(s.status ?? true),
    organization: s.organization ?? "",
    organizations: s.organizations ?? [],
  };
}
