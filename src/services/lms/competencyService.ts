import { lmsApiClient } from "./lmsApiClient";

export type CompetencyDraft = {
  code: string;
  name: string;
  description: string;
  competency_type: "KNOWLEDGE" | "SKILL" | "ATTITUDE" | "OUTCOME";
  prerequisite_codes: string[];
};

export type CompetencySuggestion = {
  framework_name: string;
  framework_code: string;
  competencies: CompetencyDraft[];
  review_required: true;
};

export const competencyService = {
  suggest: async (body: {
    title: string; subject?: string; audience?: string; language?: string;
    source_text?: string; max_competencies?: number;
  }) => {
    const response = await lmsApiClient.post<{ data: CompetencySuggestion }>("/competency-suggestions", body);
    return response.data.data;
  },
};
