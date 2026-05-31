import { useState, useEffect, useCallback } from "react";
import { labService } from "@/services/labService";
import type { Lab, LabEnrollment } from "@/types";

export function useLabs() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<LabEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingMap, setEnrollingMap] = useState<Record<number, boolean>>({});

  const [filters, setFilters] = useState({
    lab_type: "",
    category: "",
    level: "",
    search: "",
    page: 1,
    page_size: 20,
  });

  const loadLabs = useCallback(async () => {
    setLoading(true);
    try {
      const labsRes = await labService.getPublishedLabs(filters);
      setLabs(labsRes.items || []);

      const enrollmentsRes = await labService.getMyEnrollments();
      setMyEnrollments(enrollmentsRes.data || []);
    } catch (err) {
      console.error("useLabs: fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  const enroll = useCallback(async (labId: number) => {
    setEnrollingMap((prev) => ({ ...prev, [labId]: true }));
    try {
      const res = await labService.enrollLab(labId);
      if (res.success) {
        // Reload enrollments
        const enrollmentsRes = await labService.getMyEnrollments();
        setMyEnrollments(enrollmentsRes.data || []);
        return true;
      }
      return false;
    } catch (err) {
      console.error(`useLabs: enrollment failed for lab ${labId}`, err);
      return false;
    } finally {
      setEnrollingMap((prev) => ({ ...prev, [labId]: false }));
    }
  }, []);

  const isEnrolled = useCallback((labId: number) => {
    return myEnrollments.some((e) => e.labId === labId && e.status === "ACCEPTED");
  }, [myEnrollments]);

  return {
    labs,
    myEnrollments,
    loading,
    enrollingMap,
    filters,
    setFilters,
    loadLabs,
    enroll,
    isEnrolled,
  };
}
