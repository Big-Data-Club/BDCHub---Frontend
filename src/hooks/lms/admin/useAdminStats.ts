"use client";

import { useCallback, useEffect, useState } from "react";
import lmsService from "@/services/lmsService";
import { Course } from "@/types/course";

export type AdminCourseStatusFilter = "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

const PAGE_SIZE = 25;

export function useAdminStats() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<AdminCourseStatusFilter>("ALL");

  const fetchCourses = useCallback(async (targetPage: number, targetStatus: AdminCourseStatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      // The moderation endpoint includes every status. Load only the requested
      // page instead of fanning out to every page in a large catalogue.
      const result = await lmsService.listAllCoursesForAdmin({
        page: targetPage,
        page_size: PAGE_SIZE,
        ...(targetStatus === "ALL" ? {} : { status: targetStatus }),
      });
      setCourses((result?.items || []) as Course[]);
      setTotalPages(result?.pagination?.total_pages || 1);
      setTotal(result?.pagination?.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch admin courses:", err);
      setError(err.message || "Không thể tải dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(page, statusFilter);
  }, [fetchCourses, page, statusFilter]);

  const setPageSafe = useCallback((nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  }, [totalPages]);

  const setStatusFilterSafe = useCallback((status: AdminCourseStatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    fetchCourses(page, statusFilter);
  }, [fetchCourses, page, statusFilter]);

  return {
    courses,
    loading,
    error,
    page,
    totalPages,
    total,
    statusFilter,
    setPage: setPageSafe,
    setStatusFilter: setStatusFilterSafe,
    refresh,
  };
}
