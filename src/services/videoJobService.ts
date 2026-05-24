import { lmsApiClient } from "./lmsApiClient";
import type { VideoJob } from "@/types";

export interface CreateVideoJobInput {
  target_type: "course" | "section";
  target_id: number;
  custom_prompt?: string;
  language?: string;
  template_type?: string;
}

class VideoJobService {
  async create(input: CreateVideoJobInput): Promise<VideoJob> {
    const res = await lmsApiClient.post("/video-jobs", input);
    return res.data?.data ?? res.data;
  }

  async list(targetType: "course" | "section", targetId: number): Promise<VideoJob[]> {
    const res = await lmsApiClient.get(`/video-jobs?target_type=${targetType}&target_id=${targetId}`);
    return res.data?.data?.jobs ?? [];
  }

  async getById(jobId: string): Promise<VideoJob> {
    const res = await lmsApiClient.get(`/video-jobs/${jobId}`);
    return res.data?.data ?? res.data;
  }

  async publish(jobId: string): Promise<void> {
    await lmsApiClient.post(`/video-jobs/${jobId}/publish`);
  }
}

export const videoJobService = new VideoJobService();
export default videoJobService;
