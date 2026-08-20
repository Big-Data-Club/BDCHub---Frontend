import { lmsApiClient } from "./lmsApiClient";

export interface LearningEvent {
  event_type: string;
  session_id?: string;
  course_id?: number;
  lesson_id?: number;
  question_id?: number;
  skill_id?: number;
  difficulty?: number;
  correct?: boolean;
  attempt_no?: number;
  response_time_ms?: number;
  hint_count?: number;
  metadata?: Record<string, unknown>;
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
  struggling_skills: number;
  mastered_skills: number;
  overall_progress: number;
  skills: SkillState[];
}

export interface DailyRecommendation {
  content_id: number;
  content_title: string;
  content_type: string;
  skill_id: number;
  skill_name: string;
  difficulty: number;
  current_mastery: number;
  target_mastery: number;
  reason: string;
  priority: number;
  estimated_minutes: number;
}

export interface DailyRecommendationsResponse {
  student_id: number;
  greeting: string;
  motivational_message: string;
  priority_recommendations: DailyRecommendation[];
  optional_recommendations: DailyRecommendation[];
  today_goal: string;
}

export interface CourseRecommendation {
  course_id: number;
  title: string;
  match_reason: string;
  match_score: number;
  level: string;
  estimated_duration: string;
  enrollment_count: number;
  skills_you_will_learn: string[];
}

export interface DiscoverCoursesResponse {
  courses: CourseRecommendation[];
  recommendation_reason: string;
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
    return lmsApiClient.post("/personalized-learning/events", event);
  }

  /**
   * Get student's skill overview
   */
  async getStudentSkillsOverview(studentId: string | number) {
    return lmsApiClient.get<{ data: SkillsOverviewResponse }>(
      `/personalized-learning/students/${studentId}/skills/overview`
    );
  }

  /**
   * Get daily personalized recommendations
   */
  async getDailyRecommendations(studentId: string | number) {
    return lmsApiClient.get<{ data: DailyRecommendationsResponse }>(
      `/personalized-learning/students/${studentId}/recommendations/daily`
    );
  }

  /**
   * Get personalized course discovery recommendations
   */
  async getDiscoverCoursesRecommendations(studentId: string | number) {
    return lmsApiClient.get<{ data: DiscoverCoursesResponse }>(
      `/personalized-learning/students/${studentId}/recommendations/discover-courses`
    );
  }

  /**
   * Get learning trajectory (event history)
   */
  async getLearningTrajectory(studentId: string | number, days?: number) {
    const params = days ? { limit: Math.min(Math.max(days, 1), 500) } : {};
    return lmsApiClient.get<{ data: LearningTrajectoryResponse }>(
      `/personalized-learning/students/${studentId}/trajectory`,
      { params }
    );
  }
}

const personalizedLearningService = new PersonalizedLearningService();
export default personalizedLearningService;
