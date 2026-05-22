import { getAccessToken } from "@/services/authToken";

export interface Team {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface UserTypeOption {
  id: number;
  code: string;
  name: string;
  description?: string;
}

async function authHeaders(extra?: Record<string, string>): Promise<HeadersInit> {
  const headers: Record<string, string> = { ...extra };
  const token = await getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ── Public APIs (no strict authenticated session needed, e.g. for Sign Up form) ──

export async function fetchPublicTeams(): Promise<Team[]> {
  const res = await fetch(`/apiv1/api/auth/teams`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch public teams");
  return res.json();
}

export async function fetchPublicTypes(): Promise<UserTypeOption[]> {
  const res = await fetch(`/apiv1/api/auth/types`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch public types");
  return res.json();
}

// ── Admin CRUD APIs ──

// Teams CRUD
export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`/apiv1/api/admin/teams`, {
    method: "GET",
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export async function createTeam(data: { code: string; name: string; description?: string }): Promise<Team> {
  const res = await fetch(`/apiv1/api/admin/teams`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create team");
  }
  return res.json();
}

export async function updateTeam(id: number, data: { name: string; description?: string }): Promise<Team> {
  const res = await fetch(`/apiv1/api/admin/teams/${id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update team");
  }
  return res.json();
}

export async function deleteTeam(id: number): Promise<void> {
  const res = await fetch(`/apiv1/api/admin/teams/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete team");
}

// Types CRUD
export async function fetchTypes(): Promise<UserTypeOption[]> {
  const res = await fetch(`/apiv1/api/admin/types`, {
    method: "GET",
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch types");
  return res.json();
}

export async function createType(data: { code: string; name: string; description?: string }): Promise<UserTypeOption> {
  const res = await fetch(`/apiv1/api/admin/types`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create user type");
  }
  return res.json();
}

export async function updateType(id: number, data: { name: string; description?: string }): Promise<UserTypeOption> {
  const res = await fetch(`/apiv1/api/admin/types/${id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update user type");
  }
  return res.json();
}

export async function deleteType(id: number): Promise<void> {
  const res = await fetch(`/apiv1/api/admin/types/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user type");
}
