export interface RoleLike {
  name: string;
  displayName: string;
}

export function mapFrontendRoleToBackend(role: string, availableRoles?: RoleLike[]): string {
  if (!role) {
    if (availableRoles) {
      const defaultRole = availableRoles.find(
        r => r.name.toUpperCase() === "ROLE_USER" || 
             r.displayName.toLowerCase().includes("member") || 
             r.displayName.toLowerCase().includes("user")
      );
      if (defaultRole) return defaultRole.name;
    }
    return "ROLE_USER";
  }

  const cleanRole = role.trim();
  const lowerRole = cleanRole.toLowerCase();

  if (availableRoles && availableRoles.length > 0) {
    // 1. Match exact name case-insensitively
    const matchByName = availableRoles.find(
      r => r.name.toLowerCase() === lowerRole || r.name.toLowerCase() === `role_${lowerRole}`
    );
    if (matchByName) return matchByName.name;

    // 2. Match display name case-insensitively
    const matchByDisplayName = availableRoles.find(
      r => r.displayName.toLowerCase() === lowerRole || 
           r.displayName.toLowerCase().includes(lowerRole) || 
           lowerRole.includes(r.displayName.toLowerCase())
    );
    if (matchByDisplayName) return matchByDisplayName.name;
  }

  const r = cleanRole.toUpperCase();
  if (r.startsWith("ROLE_")) return r;
  
  // Legacy text mapping for bulk upload CSV
  const lower = cleanRole.toLowerCase();
  if (lower.includes("admin")) return "ROLE_ADMIN";
  if (lower.includes("manager")) return "ROLE_MANAGER";
  if (lower.includes("user") || lower.includes("member")) return "ROLE_USER";
  
  return "ROLE_" + r;
}

export function mapFrontendTeamToBackend(team: string): string {
  if (!team) return "RESEARCH";
  return team.toUpperCase();
}

export function mapFrontendTypeToBackend(type: string): string {
  if (!type) return "CLC";
  return type.toUpperCase();
}