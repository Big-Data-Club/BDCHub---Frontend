export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";
export type CourseVisibility = "PUBLIC" | "ORG_ONLY";

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  settings?: OrgSettings;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface OrgSettings {
  allow_self_enrollment: boolean;
  default_course_visibility: CourseVisibility;
  max_members?: number;
}

export interface OrgMember {
  user_id: number;
  full_name: string;
  email: string;
  org_role: OrgRole;
  joined_at: string;
}

export interface OrgStats {
  org_id: number;
  member_count: number;
  course_count: number;
  enrolled_count: number;
}

export interface CreateOrgPayload {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  settings?: Partial<OrgSettings>;
}

export interface UpdateOrgPayload {
  name?: string;
  description?: string;
  logo_url?: string;
  settings?: Partial<OrgSettings>;
}

export interface AddMemberPayload {
  user_id: number;
  org_role: OrgRole;
}

export interface UpdateMemberRolePayload {
  org_role: OrgRole;
}

export interface BulkAddMembersPayload {
  emails: string[];
  raw_input?: string;
  org_role: OrgRole;
}

export interface BulkAddMembersResponse {
  added: string[];
  not_found: string[];
}
