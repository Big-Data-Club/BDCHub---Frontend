// Auth hooks
export * from "./auth/useAuth";
export * from "./auth/useCurrentUser";

// Common & UI hooks
export * from "./common/usePagination";
export * from "./common/useInView";
export * from "./common/useScrollSnap";
export * from "./common/useScrollAnimation";
export * from "./common/useMarkdownImage";
export * from "./common/usePageContext";

// Dashboard hooks
export * from "./dashboard/useAnnouncements";
export * from "./dashboard/useEvents";
export * from "./dashboard/useTasks";
export * from "./dashboard/useCalendarTasks";
export * from "./dashboard/useTaskScores";

// LMS hooks
export * from "./lms/admin/useAdminStats";
export * from "./lms/admin/useLlmConfig";
export * from "./lms/student/useStudentDashboard";
export * from "./lms/student/useQuizCourse";
export * from "./lms/student/useForumPost";
export * from "./lms/student/useQuizTaking";
export * from "./lms/student/useQuizHistory";
export * from "./lms/student/useCourseDiscover";
export * from "./lms/student/useCourseDiscoverDetail";
export * from "./lms/teacher/useAIIndexPoller";
export * from "./lms/agent/useAgentChat";

// Chat hooks
export * from "./chat/useChat";

// Labs hooks
export * from "./labs/useLabs";
export * from "./labs/useTutorialManager";
