"use client";

import { createContext, useContext } from "react";
import type { Content, Course, Section } from "@/types";
import type { CourseProgress, ProgressDetailItem } from "@/services/progressService";

// ─── 1. Navigation Context ────────────────────────────────────────────────

export interface StudentCourseNavigationContextValue {
  course: Course | null;
  sections: Section[];
  courseId: number;
  coTeachers?: any[];
  activeContent: Content | null;
  setActiveContent: (c: Content) => void;
  sectionContents: Record<number, Content[]>;
  loadSectionContents: (sectionId: number, autoSelect?: boolean) => void;
  loadingSection: Record<number, boolean>;
}

export const StudentCourseNavigationContext = createContext<StudentCourseNavigationContextValue | null>(null);

export function useStudentCourseNavigation(): StudentCourseNavigationContextValue {
  const ctx = useContext(StudentCourseNavigationContext);
  if (!ctx) {
    throw new Error("useStudentCourseNavigation must be used within a StudentCourseNavigationContext.Provider");
  }
  return ctx;
}

// ─── 2. Progress Context ──────────────────────────────────────────────────

export interface StudentCourseProgressContextValue {
  completedIds: Set<number>;
  handleMarkComplete: (contentId: number) => Promise<void>;
  markingComplete: boolean;
  progress: CourseProgress | null;
  progressDetail: ProgressDetailItem[];
  loadProgress: () => Promise<void>;
}

export const StudentCourseProgressContext = createContext<StudentCourseProgressContextValue | null>(null);

export function useStudentCourseProgress(): StudentCourseProgressContextValue {
  const ctx = useContext(StudentCourseProgressContext);
  if (!ctx) {
    throw new Error("useStudentCourseProgress must be used within a StudentCourseProgressContext.Provider");
  }
  return ctx;
}

// ─── 3. UI Context ────────────────────────────────────────────────────────

export interface StudentCourseUiContextValue {
  expanded: Set<number>;
  toggleSection: (sectionId: number) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const StudentCourseUiContext = createContext<StudentCourseUiContextValue | null>(null);

export function useStudentCourseUi(): StudentCourseUiContextValue {
  const ctx = useContext(StudentCourseUiContext);
  if (!ctx) {
    throw new Error("useStudentCourseUi must be used within a StudentCourseUiContext.Provider");
  }
  return ctx;
}

// ─── 4. Combined Context (Backward Compatibility) ────────────────────────

export interface StudentCourseContextValue
  extends StudentCourseNavigationContextValue,
    StudentCourseProgressContextValue,
    StudentCourseUiContextValue {}

export const StudentCourseContext = createContext<StudentCourseContextValue | null>(null);

export function useStudentCourse(): StudentCourseContextValue {
  const combined = useContext(StudentCourseContext);
  const nav = useContext(StudentCourseNavigationContext);
  const prog = useContext(StudentCourseProgressContext);
  const ui = useContext(StudentCourseUiContext);

  if (combined) return combined;

  if (!nav || !prog || !ui) {
    throw new Error("useStudentCourse must be used within the appropriate StudentCourse context providers");
  }

  return {
    ...nav,
    ...prog,
    ...ui,
  };
}
