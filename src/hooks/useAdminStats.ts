"use client";

import { useState, useEffect, useCallback } from "react";
import lmsService from "@/services/lmsService";
import { Course } from "@/types/course";


export function useAdminStats() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesRes = await lmsService.listPublishedCourses();

      setCourses(coursesRes || []);
    } catch (err: any) {
      console.error("Failed to fetch admin stats:", err);
      setError(err.message || "Không thể tải dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    courses,
    loading,
    error,
    refresh: fetchStats,
  };
}
