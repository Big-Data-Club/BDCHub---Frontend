"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { videoJobService } from "@/services/videoJobService";
import type { VideoJob } from "@/types";

export function useVideoJobs(targetType: "course" | "section", targetId: number) {
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await videoJobService.list(targetType, targetId);
      setJobs(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load video jobs:", err);
      setError(err.response?.data?.message || err.message || "Failed to load video jobs");
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    
    pollIntervalRef.current = setInterval(() => {
      fetchJobs();
    }, 3000);
  }, [fetchJobs]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Fetch initial list
  useEffect(() => {
    fetchJobs();
    return () => stopPolling();
  }, [fetchJobs, stopPolling]);

  // Monitor jobs list to start/stop polling
  useEffect(() => {
    const hasActiveJob = jobs.some((job) =>
      ["PENDING", "PLANNING", "SCRIPTING", "RENDERING", "UPLOADING", "PUBLISHING"].includes(job.status)
    );

    if (hasActiveJob) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [jobs, startPolling, stopPolling]);

  const createJob = async (customPrompt?: string, language: string = "vi", templateType: string = "dark") => {
    setIsCreating(true);
    setError(null);
    try {
      const newJob = await videoJobService.create({
        target_type: targetType,
        target_id: targetId,
        custom_prompt: customPrompt,
        language,
        template_type: templateType,
      });
      setJobs((prev) => [newJob, ...prev]);
      startPolling();
      return newJob;
    } catch (err: any) {
      console.error("Failed to generate video:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to start video generation";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const publishJob = async (jobId: string) => {
    try {
      await videoJobService.publish(jobId);
      // Optimistically update visibility and status or fetch immediately
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "PUBLISHING" } : j))
      );
      fetchJobs();
    } catch (err: any) {
      console.error("Failed to publish video:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to publish video";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  return {
    jobs,
    loading,
    error,
    isCreating,
    createJob,
    publishJob,
    refresh: fetchJobs,
  };
}
export default useVideoJobs;
