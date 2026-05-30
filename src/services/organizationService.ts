import { lmsApiClient } from "./lmsApiClient";
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
    const res = await lmsApiClient.get("/admin/organizations", { params });
    return res.data.data ?? res.data;
  },

  create: async (data: CreateOrgPayload): Promise<Organization> => {
    const res = await lmsApiClient.post("/admin/organizations", data);
    return res.data.data ?? res.data;
  },

  getById: async (id: number): Promise<Organization> => {
    const res = await lmsApiClient.get(`/admin/organizations/${id}`);
    return res.data.data ?? res.data;
  },

  update: async (id: number, data: UpdateOrgPayload): Promise<Organization> => {
    const res = await lmsApiClient.put(`/admin/organizations/${id}`, data);
    return res.data.data ?? res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await lmsApiClient.delete(`/admin/organizations/${id}`);
  },

  getStats: async (id: number): Promise<OrgStats> => {
    const res = await lmsApiClient.get(`/admin/organizations/${id}/stats`);
    return res.data.data ?? res.data;
  },

  // ── Member management ─────────────────────────────────────────────────────

  listMembers: async (
    orgId: number,
    params?: { page?: number; limit?: number }
  ): Promise<OrgMemberListResponse> => {
    const res = await lmsApiClient.get(
      `/admin/organizations/${orgId}/members`,
      { params }
    );
    return res.data.data ?? res.data;
  },

  addMember: async (orgId: number, data: AddMemberPayload): Promise<void> => {
    await lmsApiClient.post(`/admin/organizations/${orgId}/members`, data);
  },

  updateMemberRole: async (
    orgId: number,
    userId: number,
    data: UpdateMemberRolePayload
  ): Promise<void> => {
    await lmsApiClient.put(
      `/admin/organizations/${orgId}/members/${userId}/role`,
      data
    );
  },

  removeMember: async (orgId: number, userId: number): Promise<void> => {
    await lmsApiClient.delete(
      `/admin/organizations/${orgId}/members/${userId}`
    );
  },

  bulkAddMembers: async (
    orgId: number,
    data: BulkAddMembersPayload
  ): Promise<BulkAddMembersResponse> => {
    const res = await lmsApiClient.post(
      `/admin/organizations/${orgId}/members/bulk`,
      data
    );
    return res.data.data ?? res.data;
  },

  // ── Current user ──────────────────────────────────────────────────────────

  getMyOrgs: async (): Promise<Organization[]> => {
    const res = await lmsApiClient.get("/my/orgs");
    return res.data.data ?? res.data;
  },
};
