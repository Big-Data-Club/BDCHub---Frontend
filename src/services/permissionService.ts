import { lmsApiClient } from './lmsApiClient';

export interface Permission {
  id: number;
  code: string;
  module: string;
  description: string;
}

export interface RolePermissions {
  role_id: number;
  role_name: string;
  permissions: Permission[];
}

export interface LmsRole {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
}

export const permissionService = {
  /**
   * Fetch all LMS role_definitions.
   * Proxy rewrites /lmsapiv1/* -> LMS_URL/api/v1/*
   * So we call /admin/roles (NOT /api/v1/admin/roles).
   */
  getLmsRoles: async (): Promise<LmsRole[]> => {
    const response = await lmsApiClient.get<LmsRole[]>('/admin/roles');
    return response.data ?? [];
  },

  /**
   * Fetch all available permissions (master list).
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await lmsApiClient.get<{ data: Permission[] }>('/admin/permissions');
    return response.data.data ?? [];
  },

  /**
   * Fetch permissions currently assigned to a specific LMS role ID.
   */
  getRolePermissions: async (lmsRoleId: number): Promise<RolePermissions> => {
    const response = await lmsApiClient.get<{ data: RolePermissions }>(`/admin/roles/${lmsRoleId}/permissions`);
    return response.data.data;
  },

  /**
   * Replace all permissions for a LMS role.
   */
  assignPermissions: async (lmsRoleId: number, permissionIds: number[]): Promise<void> => {
    await lmsApiClient.put(`/admin/roles/${lmsRoleId}/permissions`, {
      permission_ids: permissionIds,
    });
  },
};
