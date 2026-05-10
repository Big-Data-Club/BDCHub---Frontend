import { apiClient } from "./api";

export interface TaskScoreRequest {
  taskId: number;
  userId: number;
  score: number;
  notes?: string;
}

export interface TaskScoreResponse {
  id: number;
  taskId: number;
  taskTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  userCode: string;
  score: number;
  applied: boolean;
  scoredById?: number;
  scoredByName?: string;
  scoredAt?: string;
  appliedAt?: string;
  notes?: string;
}

export const taskScoreService = {
  // Lấy điểm của một user cho một task
  getScore: (taskId: number, userId: number) =>
    apiClient.get<TaskScoreResponse>(`/api/task-scores/${taskId}/${userId}`),

  // Lấy tất cả điểm của một task
  getTaskScores: (taskId: number) =>
    apiClient.get<TaskScoreResponse[]>(`/api/task-scores/task/${taskId}`),

  // Lấy tất cả điểm của một user
  getUserScores: (userId: number) =>
    apiClient.get<TaskScoreResponse[]>(`/api/task-scores/user/${userId}`),

  // Lấy tổng điểm đã áp dụng của một user
  getTotalScore: (userId: number) =>
    apiClient.get<{ totalScore: number }>(`/api/task-scores/user/${userId}/total`),

  // Thêm/cập nhật điểm cho một user trong một task
  setScore: (data: TaskScoreRequest, adminUserId: number) =>
    apiClient.post<TaskScoreResponse>(`/api/task-scores/set?adminUserId=${adminUserId}`, data),

  // Trừ điểm cho một user trong một task
  deductScore: (taskId: number, userId: number, deductAmount: number, reason: string, adminUserId: number) =>
    apiClient.patch<TaskScoreResponse>(
      `/api/task-scores/${taskId}/${userId}/deduct?deductAmount=${deductAmount}&reason=${encodeURIComponent(reason)}&adminUserId=${adminUserId}`,
      {}
    ),

  // Cộng điểm cho tất cả assignees của một task
  applyScoresToTask: (taskId: number, adminUserId: number) =>
    apiClient.post<TaskScoreResponse[]>(`/api/task-scores/${taskId}/apply?adminUserId=${adminUserId}`, {}),

  // Áp dụng/huỷ áp dụng điểm cho một user cụ thể trên một task
  toggleApplyScore: (taskId: number, userId: number, applied: boolean, adminUserId: number) =>
    apiClient.patch<TaskScoreResponse>(
      `/api/task-scores/${taskId}/${userId}/toggle?applied=${applied}&adminUserId=${adminUserId}`,
      {}
    ),

  // Xoá điểm của một user trong một task
  deleteScore: (taskId: number, userId: number, adminUserId: number) =>
    apiClient.delete(`/api/task-scores/${taskId}/${userId}?adminUserId=${adminUserId}`),

  // Khởi tạo điểm cho tất cả assignees của một task
  initializeScoresForTask: (taskId: number, initialScore: number, adminUserId: number) =>
    apiClient.post<TaskScoreResponse[]>(
      `/api/task-scores/${taskId}/initialize?initialScore=${initialScore}&adminUserId=${adminUserId}`,
      {}
    ),

  // Hoàn thành task và cộng điểm cho tất cả assignees
  completeTaskAndApplyScores: (taskId: number, adminUserId: number) =>
    apiClient.post<TaskScoreResponse[]>(`/api/task-scores/${taskId}/complete?adminUserId=${adminUserId}`, {}),
};
