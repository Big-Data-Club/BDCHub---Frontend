import lmsService from "./lmsService";
import type { LearningScopeSection } from "@/types/lms/learning-scope";

export const learningScopeService = {
  async list(courseId: number): Promise<LearningScopeSection[]> {
    const response = await lmsService.listSections(courseId);
    const sections: { id: number; title: string }[] = response?.data ?? [];
    return Promise.all(sections.map(async (section) => {
      const response = await lmsService.listContent(section.id);
      const contents: LearningScopeSection["contents"] = response?.data ?? [];
      return { ...section, contents: contents.filter((c) => ["TEXT", "DOCUMENT", "VIDEO", "IMAGE"].includes(c.type)) };
    }));
  },
};
