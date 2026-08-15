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
      // Admin moderation uses its own endpoint, which includes draft and
      // archived courses without changing the student catalogue's visibility.
      const firstPage = await lmsService.listAllCoursesForAdmin({ page: 1, page_size: 100 });
      const pagination = firstPage?.pagination;
      const remainingPages = Array.from(
        { length: Math.max(0, (pagination?.total_pages ?? 1) - 1) },
        (_, index) => index + 2,
      );
      const remainingResults = await Promise.all(
        remainingPages.map((page) => lmsService.listAllCoursesForAdmin({ page, page_size: 100 })),
      );

      setCourses([
        ...((firstPage?.items || []) as Course[]),
        ...remainingResults.flatMap((result) => (result?.items || []) as Course[]),
      ]);
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
