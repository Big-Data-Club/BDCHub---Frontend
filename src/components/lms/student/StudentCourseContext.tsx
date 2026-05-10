"use client";

import { createContext, useContext } from "react";
import type { Content, Course, Section } from "@/types";
import type { CourseProgress, ProgressDetailItem } from "@/services/progressService";

// ─── Context value type ────────────────────────────────────────────────────────

export interface StudentCourseContextValue {
  // Course
  course: Course | null;
  sections: Section[];
  courseId: number;

  // Content navigation
  activeContent: Content | null;
  setActiveContent: (c: Content) => void;
  sectionContents: Record<number, Content[]>;
  loadSectionContents: (sectionId: number, autoSelect?: boolean) => void;
  loadingSection: Record<number, boolean>;

  // Sidebar
  expanded: Set<number>;
  toggleSection: (sectionId: number) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Progress
  completedIds: Set<number>;
  handleMarkComplete: (contentId: number) => Promise<void>;
  markingComplete: boolean;
  progress: CourseProgress | null;
  progressDetail: ProgressDetailItem[];
  loadProgress: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const StudentCourseContext = createContext<StudentCourseContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStudentCourse(): StudentCourseContextValue {
  const ctx = useContext(StudentCourseContext);
  if (!ctx) {
    throw new Error("useStudentCourse must be used within a StudentCourseContext.Provider");
  }
  return ctx;
}
