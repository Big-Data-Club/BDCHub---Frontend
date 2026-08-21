import personalizedLearningService, {
  LearningEvent,
} from "@/services/lms/personalizedLearningService";

/**
 * Utility class for tracking learning events throughout the LMS
 * Use this to automatically send events to the personalized learning engine
 *
 * The backend derives student_id from the JWT, so callers never pass it.
 * All methods are fire-and-forget: tracking failures must never break UX.
 */
class PersonalizedLearningTracker {
  /**
   * Track when a student opens a lesson
   */
  trackLessonOpened(lessonId: number, courseId?: number) {
    const event: LearningEvent = {
      event_type: "lesson_opened",
      lesson_id: lessonId,
      course_id: courseId,
    };
    personalizedLearningService.trackEvent(event).catch((error) => {
      console.error("Failed to track lesson_opened event:", error);
    });
  }

  /**
   * Track when a student completes a lesson
   */
  trackLessonCompleted(
    lessonId: number,
    timeSpentSeconds: number,
    courseId?: number
  ) {
    const event: LearningEvent = {
      event_type: "lesson_completed",
      lesson_id: lessonId,
      course_id: courseId,
      response_time_ms: Math.round(timeSpentSeconds * 1000),
    };
    personalizedLearningService.trackEvent(event).catch((error) => {
      console.error("Failed to track lesson_completed event:", error);
    });
  }

  /**
   * Track when a student submits an answer to a question. questionId is
   * omitted for AI-generated questions that have no DB record; such events
   * power trajectory views but skip skill-mastery inference.
   */
  trackAnswerSubmitted(params: {
    questionId?: number;
    courseId?: number;
    correct?: boolean;
    hintsUsed?: number;
    timeSpentSeconds?: number;
    attemptNo?: number;
    metadata?: Record<string, unknown>;
  }) {
    const event: LearningEvent = {
      event_type: "answer_submitted",
      question_id: params.questionId,
      course_id: params.courseId,
      correct: params.correct,
      hint_count: params.hintsUsed,
      attempt_no: params.attemptNo,
      response_time_ms: params.timeSpentSeconds
        ? Math.round(params.timeSpentSeconds * 1000)
        : undefined,
      metadata: params.metadata,
    };
    personalizedLearningService.trackEvent(event).catch((error) => {
      console.error("Failed to track answer_submitted event:", error);
    });
  }

  /**
   * Track when a student requests a hint
   */
  trackHintRequested(questionId: number, hintsUsed: number, courseId?: number) {
    const event: LearningEvent = {
      event_type: "hint_requested",
      question_id: questionId,
      hint_count: hintsUsed,
      course_id: courseId,
    };
    personalizedLearningService.trackEvent(event).catch((error) => {
      console.error("Failed to track hint_requested event:", error);
    });
  }
}

const personalizedLearningTracker = new PersonalizedLearningTracker();
export default personalizedLearningTracker;
