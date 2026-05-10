import { lmsApiClient } from "./lmsApiClient";

class QuizService {
  // ─── Quiz Management (Teacher) ────────────────────────────────────────────

  async createQuizWithContent(contentId: number, quizData: any) {
    const payload = { ...quizData, content_id: contentId };

    if (payload.available_from)
      payload.available_from = new Date(payload.available_from).toISOString();
    if (payload.available_until)
      payload.available_until = new Date(payload.available_until).toISOString();
    if (payload.time_limit_minutes)
      payload.time_limit_minutes = Number(payload.time_limit_minutes);
    if (payload.max_attempts)
      payload.max_attempts = Number(payload.max_attempts);
    if (payload.passing_score)
      payload.passing_score = Number(payload.passing_score);
    if (payload.total_points)
      payload.total_points = Number(payload.total_points);

    const response = await lmsApiClient.post("/quizzes", payload);
    return response.data;
  }

  async createQuiz(quizData: any) {
    const response = await lmsApiClient.post("/quizzes", quizData);
    return response.data;
  }

  async getQuiz(quizId: number) {
    const response = await lmsApiClient.get(`/quizzes/${quizId}`);
    return response.data;
  }

  async getQuizByContentId(contentId: number) {
    const response = await lmsApiClient.get(`/content/${contentId}/quiz`);
    return response.data;
  }

  async updateQuiz(quizId: number, updates: any) {
    const response = await lmsApiClient.put(`/quizzes/${quizId}`, updates);
    return response.data;
  }

  async deleteQuiz(quizId: number) {
    const response = await lmsApiClient.delete(`/quizzes/${quizId}`);
    return response.data;
  }

  // ─── Question Management (Teacher) ────────────────────────────────────────

  async createQuestion(quizId: number, questionData: any) {
    const data = { ...questionData, quiz_id: quizId };
    const response = await lmsApiClient.post(
      `/quizzes/${quizId}/questions`,
      data
    );
    return response.data;
  }

  async updateQuestion(questionId: number, updates: any) {
    const response = await lmsApiClient.put(`/questions/${questionId}`, updates);
    return response.data;
  }

  async deleteQuestion(questionId: number) {
    const response = await lmsApiClient.delete(`/questions/${questionId}`);
    return response.data;
  }

  async listQuestions(quizId: number) {
    const response = await lmsApiClient.get(`/quizzes/${quizId}/questions`);
    return response.data;
  }

  // ─── Student Quiz Operations ──────────────────────────────────────────────

  async startQuizAttempt(quizId: number) {
    const response = await lmsApiClient.post(`/quizzes/${quizId}/start`);
    return response.data;
  }

  async submitAnswer(attemptId: number, answerData: any) {
    const response = await lmsApiClient.post(
      `/attempts/${attemptId}/answers`,
      answerData
    );
    return response.data;
  }

  async submitQuiz(attemptId: number) {
    const response = await lmsApiClient.post(`/attempts/${attemptId}/submit`);
    return response.data;
  }

  async getQuizResult(attemptId: number) {
    const response = await lmsApiClient.get(`/attempts/${attemptId}/result`);
    return response.data;
  }

  async reviewQuiz(attemptId: number) {
    const response = await lmsApiClient.get(`/attempts/${attemptId}/review`);
    return response.data;
  }

  // ─── Grading Operations (Teacher) ─────────────────────────────────────────

  async gradeAnswer(answerId: number, gradeData: any) {
    const response = await lmsApiClient.post(
      `/answers/${answerId}/grade`,
      gradeData
    );
    return response.data;
  }

  async bulkGrade(quizId: number, grades: any[]) {
    const response = await lmsApiClient.post(`/quizzes/${quizId}/bulk-grade`, {
      grades,
    });
    return response.data;
  }

  async listAnswersForGrading(quizId: number) {
    const response = await lmsApiClient.get(`/quizzes/${quizId}/grading`);
    return response.data;
  }

  // ─── Question Images ──────────────────────────────────────────────────────

  async uploadQuestionImage(questionId: number, file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await lmsApiClient.post(
      `/questions/${questionId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  }

  async listQuestionImages(questionId: number) {
    const response = await lmsApiClient.get(`/questions/${questionId}/images`);
    return response.data;
  }

  async deleteQuestionImage(questionId: number, imageId: number | string) {
    const response = await lmsApiClient.delete(
      `/questions/${questionId}/images/${imageId}`
    );
    return response.data;
  }

  // ─── Quiz History ─────────────────────────────────────────────────────────

  async getMyQuizAttempts(quizId: number) {
    const response = await lmsApiClient.get(`/quizzes/${quizId}/my-attempts`);
    return response.data;
  }

  async getAttemptSummary(attemptId: number) {
    const response = await lmsApiClient.get(`/attempts/${attemptId}/summary`);
    return response.data;
  }

  async getAttemptAnswers(attemptId: number) {
    const response = await lmsApiClient.get(`/attempts/${attemptId}/answers`);
    return response.data;
  }
}

export const quizService = new QuizService();
export default quizService;