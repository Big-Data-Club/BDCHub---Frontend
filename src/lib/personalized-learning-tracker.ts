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
  async trackLessonOpened(studentId: string | number, lessonId: number) {
    const event: LearningEvent = {
      student_id: Number(studentId),
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
    studentId: string | number,
    lessonId: number,
    timeSpentSeconds: number
  ) {
    const event: LearningEvent = {
      student_id: Number(studentId),
      event_type: "lesson_completed",
      lesson_id: lessonId,
      time_spent_seconds: timeSpentSeconds,
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
    studentId: string | number,
    questionId: number,
    answerId: number,
    isCorrect: boolean,
    hintsUsed: number = 0,
    timeSpentSeconds?: number,
    difficultyLevel?: string
  ) {
    const event: LearningEvent = {
      student_id: Number(studentId),
      event_type: "answer_submitted",
      question_id: questionId,
      answer_id: answerId,
      is_correct: isCorrect,
      hints_used: hintsUsed,
      time_spent_seconds: timeSpentSeconds,
      difficulty_level: difficultyLevel,
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
    studentId: string | number,
    questionId: number,
    hintsUsed: number
  ) {
    const event: LearningEvent = {
      student_id: Number(studentId),
      event_type: "hint_requested",
      question_id: questionId,
      hints_used: hintsUsed,
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
    studentId: string | number,
    lessonId: number,
    skillIds: number[]
  ) {
    const event: LearningEvent = {
      student_id: Number(studentId),
      event_type: "skill_reviewed",
      lesson_id: lessonId,
      skill_ids: skillIds,
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
