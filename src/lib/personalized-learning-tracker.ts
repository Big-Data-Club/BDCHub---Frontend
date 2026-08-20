import personalizedLearningService, {
  LearningEvent,
} from "@/services/lms/personalizedLearningService";

/**
 * Utility class for tracking learning events throughout the LMS
 * Use this to automatically send events to the personalized learning engine
 */
class PersonalizedLearningTracker {
  /**
   * Track when a student opens a lesson
   */
  async trackLessonOpened(_studentId: string | number, lessonId: number) {
    const event: LearningEvent = {
      event_type: "lesson_opened",
      lesson_id: lessonId,
    };

    try {
      await personalizedLearningService.trackEvent(event);
    } catch (error) {
      console.error("Failed to track lesson_opened event:", error);
    }
  }

  /**
   * Track when a student completes a lesson
   */
  async trackLessonCompleted(
    _studentId: string | number,
    lessonId: number,
    timeSpentSeconds: number
  ) {
    const event: LearningEvent = {
      event_type: "lesson_completed",
      lesson_id: lessonId,
      response_time_ms: timeSpentSeconds * 1000,
    };

    try {
      await personalizedLearningService.trackEvent(event);
    } catch (error) {
      console.error("Failed to track lesson_completed event:", error);
    }
  }

  /**
   * Track when a student submits an answer to a question
   */
  async trackAnswerSubmitted(
    _studentId: string | number,
    questionId: number,
    _answerId: number,
    isCorrect: boolean,
    hintsUsed: number = 0,
    timeSpentSeconds?: number,
    difficulty?: number
  ) {
    const event: LearningEvent = {
      event_type: "answer_submitted",
      question_id: questionId,
      correct: isCorrect,
      hint_count: hintsUsed,
      response_time_ms: timeSpentSeconds ? timeSpentSeconds * 1000 : undefined,
      difficulty,
    };

    try {
      await personalizedLearningService.trackEvent(event);
    } catch (error) {
      console.error("Failed to track answer_submitted event:", error);
    }
  }

  /**
   * Track when a student requests a hint
   */
  async trackHintRequested(
    _studentId: string | number,
    questionId: number,
    hintsUsed: number
  ) {
    const event: LearningEvent = {
      event_type: "hint_requested",
      question_id: questionId,
      hint_count: hintsUsed,
    };

    try {
      await personalizedLearningService.trackEvent(event);
    } catch (error) {
      console.error("Failed to track hint_requested event:", error);
    }
  }

  /**
   * Track when a student reviews mastered content (spaced repetition)
   */
  async trackSkillReviewed(
    _studentId: string | number,
    lessonId: number,
    skillIds: number[]
  ) {
    const event: LearningEvent = {
      event_type: "lesson_completed",
      lesson_id: lessonId,
      metadata: { skill_ids: skillIds, review: true },
    };

    try {
      await personalizedLearningService.trackEvent(event);
    } catch (error) {
      console.error("Failed to track skill_reviewed event:", error);
    }
  }
}

const personalizedLearningTracker = new PersonalizedLearningTracker();
export default personalizedLearningTracker;
