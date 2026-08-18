import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import {
  consumeRecommendationAttribution,
  trackRecommendationEvent,
} from "@/services/recommendationService";
import { Course, Section } from "@/types";

export function useCourseDiscoverDetail(courseId: number) {
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [coTeachers, setCoTeachers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (isNaN(courseId)) return;
    setLoading(true);
    setError("");
    try {
      const [courseRes, sectionsRes, enrollmentsRes] = await Promise.all([
        lmsService.getCourse(courseId),
        lmsService.listSections(courseId),
        lmsService.getMyEnrollments("ACCEPTED"),
      ]);

      const courseData: Course = courseRes?.data ?? courseRes;
      setCourse(courseData);

      const secs: Section[] = Array.isArray(sectionsRes?.data)
        ? sectionsRes.data
        : (Array.isArray(sectionsRes) ? sectionsRes : []);
      setSections(secs);

      const enrollmentsArray = Array.isArray(enrollmentsRes) ? enrollmentsRes : [];
      const enrolledIds = new Set(enrollmentsArray.map((e: any) => e.course_id));
      setIsEnrolled(enrolledIds.has(courseId));

      try {
        const teachers = await lmsService.getCoTeachers(courseId);
        setCoTeachers(teachers ?? []);
      } catch {
        setCoTeachers([]);
      }
    } catch {
      setError("Không thể tải thông tin khóa học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setError("");
    try {
      await lmsService.enrollCourse(courseId);
      const attribution = consumeRecommendationAttribution(courseId);
      if (attribution) {
        trackRecommendationEvent(
          attribution.item,
          attribution.recommendationSetId,
          "accept",
          attribution.surface,
        );
      }
      router.push(`/lms/student/courses/${courseId}/learn`);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      setEnrolling(false);
    }
  };

  const handleGoLearn = () => {
    router.push(`/lms/student/courses/${courseId}/learn`);
  };

  return {
    course,
    sections,
    coTeachers,
    isEnrolled,
    loading,
    enrolling,
    error,
    handleEnroll,
    handleGoLearn,
    loadData,
  };
}
