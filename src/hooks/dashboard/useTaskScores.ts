"use client";

import { useState, useCallback } from "react";
import { taskScoreService, TaskScoreResponse } from "@/services/taskScoreService";

export const useTaskScores = () => {
  const [scores, setScores] = useState<TaskScoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskScores = useCallback(async (taskId: number) => {
    try {
      setLoading(true);
      const data = await taskScoreService.getTaskScores(taskId);
      setScores(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch scores";
      setError(errorMsg);
      console.error("Error fetching task scores:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserScores = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const data = await taskScoreService.getUserScores(userId);
      setScores(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch user scores";
      setError(errorMsg);
      console.error("Error fetching user scores:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const setScore = useCallback(
    async (taskId: number, userId: number, score: number, notes?: string, adminUserId?: number) => {
      if (!adminUserId) {
        setError("Admin user ID is required");
        return null;
      }
      try {
        setLoading(true);
        const result = await taskScoreService.setScore(
          { taskId, userId, score, notes },
          adminUserId
        );
        setError(null);
        await fetchTaskScores(taskId);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to set score";
        setError(errorMsg);
        console.error("Error setting score:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchTaskScores]
  );

  const deductScore = useCallback(
    async (
      taskId: number,
      userId: number,
      amount: number,
      reason: string,
      adminUserId: number
    ) => {
      try {
        setLoading(true);
        const result = await taskScoreService.deductScore(
          taskId,
          userId,
          amount,
          reason,
          adminUserId
        );
        setError(null);
        await fetchTaskScores(taskId);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to deduct score";
        setError(errorMsg);
        console.error("Error deducting score:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchTaskScores]
  );

  const applyScores = useCallback(
    async (taskId: number, adminUserId: number) => {
      try {
        setLoading(true);
        const result = await taskScoreService.applyScoresToTask(taskId, adminUserId);
        setScores(result);
        setError(null);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to apply scores";
        setError(errorMsg);
        console.error("Error applying scores:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const toggleApplyScore = useCallback(
    async (taskId: number, userId: number, applied: boolean, adminUserId: number) => {
      try {
        setLoading(true);
        const result = await taskScoreService.toggleApplyScore(
          taskId,
          userId,
          applied,
          adminUserId
        );
        setError(null);
        await fetchTaskScores(taskId);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to toggle score";
        setError(errorMsg);
        console.error("Error toggling score:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchTaskScores]
  );

  const deleteScore = useCallback(
    async (taskId: number, userId: number, adminUserId: number) => {
      try {
        setLoading(true);
        await taskScoreService.deleteScore(taskId, userId, adminUserId);
        setError(null);
        await fetchTaskScores(taskId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to delete score";
        setError(errorMsg);
        console.error("Error deleting score:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchTaskScores]
  );

  const initializeScores = useCallback(
    async (taskId: number, initialScore: number, adminUserId: number) => {
      try {
        setLoading(true);
        const result = await taskScoreService.initializeScoresForTask(
          taskId,
          initialScore,
          adminUserId
        );
        setScores(result);
        setError(null);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to initialize scores";
        setError(errorMsg);
        console.error("Error initializing scores:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const completeTaskAndApplyScores = useCallback(
    async (taskId: number, adminUserId: number) => {
      try {
        setLoading(true);
        const result = await taskScoreService.completeTaskAndApplyScores(
          taskId,
          adminUserId
        );
        setScores(result);
        setError(null);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to complete task";
        setError(errorMsg);
        console.error("Error completing task:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getTotalScore = useCallback(async (userId: number) => {
    try {
      const result = await taskScoreService.getTotalScore(userId);
      return result.totalScore;
    } catch (err) {
      console.error("Error getting total score:", err);
      return 0;
    }
  }, []);

  return {
    scores,
    loading,
    error,
    fetchTaskScores,
    fetchUserScores,
    setScore,
    deductScore,
    applyScores,
    toggleApplyScore,
    deleteScore,
    initializeScores,
    completeTaskAndApplyScores,
    getTotalScore,
  };
};
