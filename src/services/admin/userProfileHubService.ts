import { apiClient } from "../common/api";

export interface ProfileItem {
  id: string;
  label: string;
  type: "TEXT" | "MARKDOWN" | "LINK" | "DATE" | "DATE_RANGE" | "KEY_VALUE" | "TAG_LIST" | "MEDIA";
  value: any;
}

export interface ProfileSection {
  id: string;
  type: "BIO" | "ACADEMIC" | "EXPERIENCE" | "PUBLICATIONS" | "SOCIAL" | "CONTACT" | "CUSTOM";
  title: string;
  visible: boolean;
  order: number;
  items: ProfileItem[];
}

export interface UserProfileStats {
  courses_enrolled?: number;
  courses_completed?: number;
  courses_created?: number;
  total_learning_hours?: number;
  [key: string]: any;
}

export interface PublicUserProfile {
  userId: number;
  alias: string;
  published: boolean;
  message?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  userType?: string;
  organization?: string;
  title?: string;
  bio?: string;
  sections?: ProfileSection[];
  layoutConfig?: any;
  stats?: UserProfileStats;
  allowDirectChat?: boolean;
}

export interface UserProfileConfigRequest {
  alias?: string;
  published?: boolean;
  title?: string;
  bio?: string;
  sectionsJson?: string;
  layoutConfigJson?: string;
  allowDirectChat?: boolean;
}

export interface AliasCheckResponse {
  available: boolean;
  alias: string;
  reason?: string;
}

export const userProfileHubService = {
  async getPublicProfile(identifier: string): Promise<PublicUserProfile> {
    return apiClient.get<PublicUserProfile>(`/hub/${encodeURIComponent(identifier)}`);
  },

  async getMyProfileConfig(): Promise<PublicUserProfile> {
    return apiClient.get<PublicUserProfile>("/myaccount/profile-config");
  },

  async updateMyProfileConfig(data: UserProfileConfigRequest): Promise<PublicUserProfile> {
    return apiClient.put<PublicUserProfile>("/myaccount/profile-config", data);
  },

  async checkAlias(alias: string): Promise<AliasCheckResponse> {
    return apiClient.get<AliasCheckResponse>(`/hub/alias/check?alias=${encodeURIComponent(alias)}`);
  },
};
