import apiClient from "@/lib/api-client";

export interface LearningEvent {
  event_id?: number;
  student_id: number;
  event_type: string;
  lesson_id?: number;
  question_id?: number;
  answer_id?: number;
  is_correct?: boolean;
  hints_used?: number;
  time_spent_seconds?: number;
  difficulty_level?: string;
  skill_ids?: number[];
  timestamp?: string;
}

export interface SkillState {
  skill_id: number;
  skill_name: string;
  mastery_level: string;
  mastery_percentage: number;
  progress_indicator: string;
  next_action: string;
  last_practiced?: string;
}

export interface SkillsOverviewResponse {
  student_id: number;
  total_skills: number;
  struggling_count: number;
  developing_count: number;
  advancing_count: number;
  mastered_count: number;
  overall_progress_percentage: number;
  skills: SkillState[];
}

export interface DailyRecommendation {
  lesson_id: number;
  lesson_name: string;
  course_title: string;
  reason: string;
  priority: number;
  estimated_minutes: number;
  skills: string[];
}

export interface DailyRecommendationsResponse {
  today: string;
  message: string;
  recommendations: DailyRecommendation[];
  total_estimated_minutes: number;
}

export interface CourseRecommendation {
  course_id: number;
  course_name: string;
  reason: string;
  match_percentage: number;
  difficulty_level: string;
  estimated_hours: number;
  enrollment_count: number;
  skills: string[];
  badges: { text: string; color: string }[];
}

export interface DiscoverCoursesResponse {
  message: string;
  recommendations: CourseRecommendation[];
}

export interface TrajectoryEvent {
  event_id: number;
  event_type: string;
  lesson_name?: string;
  question_text?: string;
  is_correct?: boolean;
  hints_used?: number;
  time_spent_seconds?: number;
  skills: string[];
  timestamp: string;
}

export interface LearningTrajectoryResponse {
  student_id: number;
  total_events: number;
  date_range: {
    from: string;
    to: string;
  };
  events: TrajectoryEvent[];
}

class PersonalizedLearningService {
  /**
   * Track a learning event
   */
  async trackEvent(event: LearningEvent) {
    return apiClient.post("/lms/personalized-learning/events", event);
  }

  /**
   * Get student's skill overview
   */
  async getStudentSkillsOverview(studentId: number) {
    return apiClient.get<SkillsOverviewResponse>(
      `/lms/personalized-learning/students/${studentId}/skills/overview`
    );
  }

  /**
   * Get daily personalized recommendations
   */
  async getDailyRecommendations(studentId: number) {
    return apiClient.get<DailyRecommendationsResponse>(
      `/lms/personalized-learning/students/${studentId}/recommendations/daily`
    );
  }

  /**
   * Get personalized course discovery recommendations
   */
  async getDiscoverCoursesRecommendations(studentId: number) {
    return apiClient.get<DiscoverCoursesResponse>(
      `/lms/personalized-learning/students/${studentId}/recommendations/discover-courses`
    );
  }

  /**
   * Get learning trajectory (event history)
   */
  async getLearningTrajectory(studentId: number, days?: number) {
    const params = days ? { days } : {};
    return apiClient.get<LearningTrajectoryResponse>(
      `/lms/personalized-learning/students/${studentId}/trajectory`,
      { params }
    );
  }
}

const personalizedLearningService = new PersonalizedLearningService();
export default personalizedLearningService;
