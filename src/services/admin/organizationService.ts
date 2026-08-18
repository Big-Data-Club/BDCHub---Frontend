import { lmsApiClient } from "./lmsApiClient";
import { apiClient } from "./api";
import type {
  Organization,
  OrgMember,
  OrgStats,
  CreateOrgPayload,
  UpdateOrgPayload,
  AddMemberPayload,
  UpdateMemberRolePayload,
  BulkAddMembersPayload,
  BulkAddMembersResponse,
} from "@/types";

export interface OrgListResponse {
  items: Organization[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface OrgMemberListResponse {
  items: OrgMember[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const organizationService = {
  // ── Organization CRUD (Super Admin) ──────────────────────────────────────

  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<OrgListResponse> => {
    const list = await apiClient.get<Organization[]>("/api/organizations");
    
    // Apply local search filtering
    let filtered = list;
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = list.filter(
        (o) => o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q)
      );
    }
    
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginated,
      page,
      limit,
      total,
      total_pages: totalPages,
    };
  },

  create: async (data: CreateOrgPayload): Promise<Organization> => {
    return apiClient.post<Organization>("/api/organizations", data);
  },

  getById: async (id: number): Promise<Organization> => {
    return apiClient.get<Organization>(`/api/organizations/${id}`);
  },

  update: async (id: number, data: UpdateOrgPayload): Promise<Organization> => {
    return apiClient.put<Organization>(`/api/organizations/${id}`, data);
  },

  deactivate: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/organizations/${id}`);
  },

  getStats: async (id: number): Promise<OrgStats> => {
    // Stats remain in lms-service because lms-service owns courses and enrollments
    const res = await lmsApiClient.get(`/admin/organizations/${id}/stats`);
    return res.data.data ?? res.data;
  },

  // ── Member management ─────────────────────────────────────────────────────

  listMembers: async (
    orgId: number,
    params?: { page?: number; limit?: number }
  ): Promise<OrgMemberListResponse> => {
    const list = await apiClient.get<OrgMember[]>(
      `/api/organizations/${orgId}/members`
    );
    
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);
    const total = list.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginated,
      page,
      limit,
      total,
      total_pages: totalPages,
    };
  },

  addMember: async (orgId: number, data: AddMemberPayload): Promise<void> => {
    await apiClient.post(`/api/organizations/${orgId}/members`, data);
  },

  updateMemberRole: async (
    orgId: number,
    userId: number,
    data: UpdateMemberRolePayload
  ): Promise<void> => {
    await apiClient.put(
      `/api/organizations/${orgId}/members/${userId}/role`,
      data
    );
  },

  removeMember: async (orgId: number, userId: number): Promise<void> => {
    await apiClient.delete(
      `/api/organizations/${orgId}/members/${userId}`
    );
  },

  bulkAddMembers: async (
    orgId: number,
    data: BulkAddMembersPayload
  ): Promise<BulkAddMembersResponse> => {
    return apiClient.post<BulkAddMembersResponse>(
      `/api/organizations/${orgId}/members/bulk`,
      data
    );
  },

  // ── Current user ──────────────────────────────────────────────────────────

  getMyOrgs: async (): Promise<Organization[]> => {
    return apiClient.get<Organization[]>("/api/organizations/my");
  },
};
