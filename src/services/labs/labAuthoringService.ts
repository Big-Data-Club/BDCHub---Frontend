import type { AuthoringJob, AuthoringTask, RuntimeStepDraft, TestCaseDraft } from "@/types/labs/authoring";
import { labApiClient } from "./labApiClient";
import { ApiClient } from "../common/api";
const ai = new ApiClient("/api/ai/lab-authoring");
export const labAuthoringService = {
  request: (task: AuthoringTask, labType: string, instruction: string, source: Record<string, unknown>, count: number) => ai.post<AuthoringJob>("", { task, lab_type: labType, instruction, source, count }),
  status: (id: string) => ai.get<AuthoringJob>(`/${id}`),
  appendCases: (labId: number, cases: TestCaseDraft[]) => labApiClient.post(`/labs/${labId}/test-cases/bulk`, { test_cases: cases }),
  replaceCases: (labId: number, cases: TestCaseDraft[], expectedIDs: number[], expectedRevision: string) => labApiClient.put(`/labs/${labId}/test-cases/replace`, { test_cases: cases, expected_ids: expectedIDs, expected_revision: expectedRevision }),
  appendSteps: (labId: number, tasks: RuntimeStepDraft[]) => labApiClient.post(`/labs/${labId}/runtime-tasks/bulk`, { tasks }),
  generate: (labId: number, generatorCode: string, referenceCode: string, count: number, seed: number, samples: TestCaseDraft[]) => labApiClient.post<{ data: { test_cases: TestCaseDraft[] } }>(`/labs/${labId}/test-cases/generate`, { language: "python", generator_code: generatorCode, reference_code: referenceCode, count, seed, samples }),
};
