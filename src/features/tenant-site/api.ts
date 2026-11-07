import { apiClient } from "@/services/common/api";
import type { SiteDocument, SiteEditorState } from "./types";
const path = (id: number) => `/api/admin/organizations/${id}/site`;
export const tenantSiteApi = {
  get: (id: number) => apiClient.get<SiteEditorState>(path(id)),
  save: (id: number, revision: number, document: SiteDocument) => apiClient.put<SiteEditorState>(path(id), { revision, document }),
  publish: (id: number, revision: number) => apiClient.post<SiteEditorState>(`${path(id)}/publish`, { revision }),
  unpublish: (id: number, revision: number) => apiClient.post<SiteEditorState>(`${path(id)}/unpublish`, { revision }),
};
