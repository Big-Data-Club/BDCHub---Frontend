import type { User, UserLogin } from "@/types/auth/user";

/** Persist display metadata only. A stored profile never establishes a session. */
export function parseStoredUser(
  raw: string | null,
): (UserLogin & Partial<User>) | null {
  try {
    const value: unknown = JSON.parse(raw || "null");
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    if (
      (typeof item.id !== "number" && typeof item.id !== "string") ||
      typeof item.name !== "string" ||
      typeof item.email !== "string" ||
      typeof item.role !== "string"
    )
      return null;
    const user: UserLogin & Partial<User> = {
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
    };
    for (const field of [
      "code",
      "team",
      "type",
      "profilePicture",
      "organization",
      "dateAdded",
    ] as const) {
      if (typeof item[field] === "string") user[field] = item[field];
    }
    for (const field of ["score", "totalScore"] as const)
      if (typeof item[field] === "number") user[field] = item[field];
    for (const field of ["active", "status"] as const)
      if (typeof item[field] === "boolean") user[field] = item[field];
    for (const field of ["roles", "lmsRoles", "organizations"] as const) {
      if (Array.isArray(item[field]))
        user[field] = item[field].filter(
          (entry): entry is string => typeof entry === "string",
        );
    }
    return user;
  } catch {
    return null;
  }
}
