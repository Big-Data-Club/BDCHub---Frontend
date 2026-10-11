export type AuthoringTask = "format_lab" | "create_lab" | "create_lab_testcase" | "edit_testcase" | "create_lab_generator";
export interface TestCaseDraft {
  name: string; input: string; expected: string; explanation?: string;
  is_sample: boolean; is_hidden: boolean; weight: number; order_index?: number;
}
export interface RuntimeStepDraft {
  title: string; description: string; verifier_type: string; verifier_config: Record<string, string>;
  weight: number; is_required: boolean; order_index: number;
}
export interface LabAuthoringProposal {
  title: string; description: string; starter_code: Record<string, string>;
  schema_sql: string; seed_sql: string; test_cases: TestCaseDraft[]; runtime_tasks: RuntimeStepDraft[];
  generator_code: string; reference_code: string; warnings: string[];
}
export interface AuthoringJob {
  id: string; status: "QUEUED" | "RUNNING" | "READY" | "FAILED";
  proposal: LabAuthoringProposal | null; error: string | null;
}
