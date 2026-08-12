import { lmsApiClient } from "./lmsApiClient";

export type RoutingDocument = { id: string; filename: string; file_path: string; content_type: string };
export type RoutingSuggestion = { document_id: string; section_id?: number | null; confidence: number; rationale: string; requires_manual_selection: boolean };
export type MaterialRoutingJob = { id: string; course_id: number; status: "PROCESSING" | "READY" | "FAILED"; documents: RoutingDocument[]; suggestions: RoutingSuggestion[]; error_message?: string };
const data = <T,>(response: { data: any }): T => (response.data?.data ?? response.data) as T;

export const materialRoutingService = {
  create: async (courseId: number, documents: RoutingDocument[]) => data<MaterialRoutingJob>(await lmsApiClient.post(`/courses/${courseId}/material-routing`, { documents })),
  get: async (courseId: number, id: string) => data<MaterialRoutingJob>(await lmsApiClient.get(`/courses/${courseId}/material-routing/${id}`)),
  apply: async (courseId: number, routingId: string, assignments: Array<{ document_id: string; section_id: number; title: string; description: string; is_mandatory: boolean }>) => data<{ created: number }>(await lmsApiClient.post(`/courses/${courseId}/material-routing/apply`, { routing_id: routingId, assignments })),
};
