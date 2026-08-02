import { lmsApiClient } from "./lmsApiClient";

export type CourseBlueprintFile = { id: string; filename: string; file_path: string; content_type: string };
export type CourseBlueprint = {
  id: string; status: "DRAFT" | "APPROVED" | "CANCELLED"; version: number;
  documents: CourseBlueprintFile[];
  plan: { title: string; description: string; category: string; level: string; tags: string[]; governance: { organization_id?: number; visibility: "PUBLIC" | "ORG_ONLY"; co_teacher_ids: number[]; thumbnail_url?: string }; chapters: Array<{ id: string; title: string; description: string; material_ids: string[]; prerequisites: string[] }> };
  validation: { valid: boolean; errors: Array<{ code: string; message: string }> };
};

const unwrap = (response: { data: unknown }) => {
  const payload = response.data as { data?: CourseBlueprint };
  return (payload.data ?? payload) as CourseBlueprint;
};

export const courseBlueprintService = {
  create: async (body: { owner_id: number; origin: "course_create" | "chatbot"; documents: CourseBlueprintFile[]; allowed_organization_ids: number[]; governance: CourseBlueprint["plan"]["governance"] }) => unwrap(await lmsApiClient.post("/course-blueprints", body)),
  update: async (id: string, body: { owner_id: number; version: number; plan: CourseBlueprint["plan"] }) => unwrap(await lmsApiClient.put(`/course-blueprints/${id}`, body)),
  approve: async (id: string, owner_id: number) => unwrap(await lmsApiClient.post(`/course-blueprints/${id}/approve`, { owner_id })),
  apply: async (id: string) => (await lmsApiClient.post(`/course-blueprints/${id}/apply`)).data?.data as { course_id: number },
  cancel: async (id: string) => lmsApiClient.post(`/course-blueprints/${id}/cancel`),
};
