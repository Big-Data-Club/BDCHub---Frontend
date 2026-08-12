import { mapServerUserToClient } from "./mappers";
import { User } from "@/types";
import { getAccessToken } from "@/services/authToken";

async function authHeaders(extra?: Record<string, string>): Promise<HeadersInit> {
  const headers: Record<string, string> = { ...extra };
  const token = await getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface UserPage {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export async function fetchUsers(params: {
  page?: number;
  pageSize?: number;
  query?: string;
  team?: string;
  type?: string;
  role?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
} = {}): Promise<UserPage> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 0),
    page_size: String(params.pageSize ?? 15),
  });
  if (params.query) searchParams.set("query", params.query);
  if (params.team) searchParams.set("team", params.team);
  if (params.type) searchParams.set("type", params.type);
  if (params.role) searchParams.set("role", params.role);
  if (params.sortBy) searchParams.set("sort_by", params.sortBy);
  if (params.sortDir) searchParams.set("sort_dir", params.sortDir);

  const res = await fetch(`/apiv1/api/users?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: await authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Fetch users failed: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`
    );
  }

  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items.map(mapServerUserToClient) : [];
  return {
    items,
    page: Number(data?.page ?? params.page ?? 0),
    pageSize: Number(data?.pageSize ?? params.pageSize ?? 15),
    total: Number(data?.total ?? items.length),
    totalPages: Number(data?.totalPages ?? (items.length ? 1 : 0)),
    hasNext: Boolean(data?.hasNext),
  };
}

export async function postBulkRegister(
  payload: Array<{
    name: string;
    email: string;
    role?: string;
    roles?: string[];
    team: string;
    code?: string;
    type: string;
    organization?: string;
    organizations?: Array<{ identifier: string; orgRole: "MEMBER" | "ADMIN" | "OWNER" }>;
  }>
) {
  const res = await fetch(`/apiv1/api/auth/register/bulk`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ users: payload }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Bulk register failed: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`
    );
  }
  return res.json();
}

export async function postCreateUserSingle(user: {
  name: string;
  email: string;
  role: string;
  team: string;
  code: string;
  type: string;
  organization?: string;
}) {
  return postBulkRegister([user]);
}

export async function updateUser(
  id: number | string,
  data: {
    name: string;
    email: string;
    team?: string;
    type?: string;
    organization?: string;
  }
): Promise<User> {
  const res = await fetch(`/apiv1/api/users/${id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Update user failed: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`
    );
  }
  const raw = await res.json();
  return mapServerUserToClient(raw);
}

export async function updateUserStatus(id: number | string): Promise<User> {
  const res = await fetch(`/apiv1/api/users/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Update status failed: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`
    );
  }
  const raw = await res.json();
  return mapServerUserToClient(raw);
}

export async function updateUserRole(id: number | string, role: string): Promise<User> {
  const res = await fetch(`/apiv1/api/users/${id}/role`, {
    method: "PATCH",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Update role failed: ${res.status} ${res.statusText}${txt ? " - " + txt : ""}`
    );
  }
  const raw = await res.json();
  return mapServerUserToClient(raw);
}
