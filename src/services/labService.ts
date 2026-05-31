import { labApiClient } from "./labApiClient";
import type { Lab, LabEnrollment } from "@/types";

export interface SuccessResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// Helper to map backend snake_case LabResponse to frontend camelCase Lab
const mapLab = (raw: any): Lab => {
  if (!raw) return raw;
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    level: raw.level,
    thumbnailUrl: raw.thumbnail_url,
    labType: raw.lab_type,
    status: raw.status,
    runtimeConfig: raw.runtime_config,
    maxSessionDurationMin: raw.max_session_duration_min,
    maxConcurrentSessions: raw.max_concurrent_sessions,
    maxSubmissions: raw.max_submissions,
    autoGrade: raw.auto_grade,
    gradingConfig: raw.grading_config,
    startTime: raw.start_time,
    deadline: raw.deadline,
    allowLateSubmission: raw.allow_late_submission,
    latePenaltyPercent: raw.late_penalty_percent,
    createdBy: raw.created_by,
    publishedAt: raw.published_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
};

// Helper to map backend snake_case LabEnrollment to frontend camelCase LabEnrollment
const mapEnrollment = (raw: any): LabEnrollment => {
  if (!raw) return raw;
  return {
    id: raw.id,
    labId: raw.lab_id,
    userId: raw.user_id,
    status: raw.status,
    enrolledAt: raw.enrolled_at,
    title: raw.title,
    labType: raw.lab_type,
    level: raw.level,
    category: raw.category,
    thumbnailUrl: raw.thumbnail_url,
  };
};

// Helper to map backend snake_case ContentResponse to frontend camelCase Content and student aliases
const mapContent = (raw: any): any => {
  if (!raw) return raw;
  return {
    id: raw.id,
    sectionId: raw.section_id,
    type: raw.type,
    contentType: raw.type, // Alias for student workspace
    title: raw.title,
    description: raw.description,
    textValue: raw.description, // Alias for student workspace
    orderIndex: raw.order_index,
    isPublished: raw.is_published,
    isMandatory: raw.is_mandatory,
    filePath: raw.file_path,
    fileKey: raw.file_path, // Alias for student workspace
    fileSize: raw.file_size,
    fileType: raw.file_type,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
};

export const labService = {
  getPublishedLabs: async (params?: {
    lab_type?: string;
    category?: string;
    level?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<ListResponse<Lab>> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    const endpoint = `/labs${queryString ? `?${queryString}` : ""}`;
    const res = await labApiClient.get<ListResponse<any>>(endpoint);
    return {
      ...res,
      items: (res.items || []).map(mapLab),
    };
  },

  getLabById: async (id: number): Promise<SuccessResponse<Lab>> => {
    const res = await labApiClient.get<SuccessResponse<any>>(`/labs/${id}`);
    return {
      ...res,
      data: mapLab(res.data),
    };
  },

  getMyLabs: async (params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ListResponse<Lab>> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    const endpoint = `/labs/my${queryString ? `?${queryString}` : ""}`;
    const res = await labApiClient.get<ListResponse<any>>(endpoint);
    return {
      ...res,
      items: (res.items || []).map(mapLab),
    };
  },

  enrollLab: async (id: number): Promise<SuccessResponse<{ enrollment_id: number }>> => {
    return labApiClient.post<SuccessResponse<{ enrollment_id: number }>>(`/labs/${id}/enroll`, {});
  },

  getMyEnrollments: async (): Promise<SuccessResponse<LabEnrollment[]>> => {
    const res = await labApiClient.get<SuccessResponse<any[]>>("/enrollments/labs/my");
    return {
      ...res,
      data: (res.data || []).map(mapEnrollment),
    };
  },

  getLabSections: async (labId: number): Promise<SuccessResponse<any[]>> => {
    return labApiClient.get<SuccessResponse<any[]>>(`/labs/${labId}/sections`);
  },

  getSectionContent: async (sectionId: number): Promise<SuccessResponse<any[]>> => {
    const res = await labApiClient.get<SuccessResponse<any[]>>(`/sections/${sectionId}/content`);
    return {
      ...res,
      data: (res.data || []).map(mapContent),
    };
  },

  runCode: async (labId: number, data: { language: string; code: string }): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/run`, data);
  },

  submitCode: async (labId: number, data: { language: string; code: string }): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/submit`, data);
  },

  getMySubmissions: async (labId: number, page = 1, pageSize = 20): Promise<any> => {
    return labApiClient.get<any>(`/labs/${labId}/submissions/my?page=${page}&page_size=${pageSize}`);
  },

  // --- ADMIN/TEACHER CRUD OPERATIONS ---
  createLab: async (data: Partial<Lab>): Promise<SuccessResponse<Lab>> => {
    // Re-map request parameters to snake_case if necessary for backend compatibility
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      thumbnail_url: data.thumbnailUrl,
      lab_type: data.labType,
      status: data.status,
      runtime_config: data.runtimeConfig,
      max_session_duration_min: data.maxSessionDurationMin,
      max_concurrent_sessions: data.maxConcurrentSessions,
      max_submissions: data.maxSubmissions,
      auto_grade: data.autoGrade,
      grading_config: data.gradingConfig,
      start_time: data.startTime,
      deadline: data.deadline,
      allow_late_submission: data.allowLateSubmission,
      late_penalty_percent: data.latePenaltyPercent
    };
    const res = await labApiClient.post<SuccessResponse<any>>("/labs", payload);
    return {
      ...res,
      data: mapLab(res.data),
    };
  },

  updateLab: async (id: number, data: Partial<Lab>): Promise<SuccessResponse<Lab>> => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      thumbnail_url: data.thumbnailUrl,
      lab_type: data.labType,
      status: data.status,
      runtime_config: data.runtimeConfig,
      max_session_duration_min: data.maxSessionDurationMin,
      max_concurrent_sessions: data.maxConcurrentSessions,
      max_submissions: data.maxSubmissions,
      auto_grade: data.autoGrade,
      grading_config: data.gradingConfig,
      start_time: data.startTime,
      deadline: data.deadline,
      allow_late_submission: data.allowLateSubmission,
      late_penalty_percent: data.latePenaltyPercent
    };
    const res = await labApiClient.put<SuccessResponse<any>>(`/labs/${id}`, payload);
    return {
      ...res,
      data: mapLab(res.data),
    };
  },

  deleteLab: async (id: number): Promise<void> => {
    return labApiClient.delete(`/labs/${id}`);
  },

  publishLab: async (id: number): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${id}/publish`, {});
  },

  createSection: async (
    labId: number,
    data: { title: string; description?: string; orderIndex?: number }
  ): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/sections`, {
      title: data.title,
      description: data.description || "",
      order_index: data.orderIndex ?? 0
    });
  },

  updateSection: async (
    sectionId: number,
    data: { title: string; description?: string; orderIndex?: number; isPublished?: boolean }
  ): Promise<SuccessResponse<any>> => {
    return labApiClient.put<SuccessResponse<any>>(`/sections/${sectionId}`, {
      title: data.title,
      description: data.description || "",
      order_index: data.orderIndex ?? 0,
      is_published: data.isPublished ?? true
    });
  },

  deleteSection: async (sectionId: number): Promise<void> => {
    return labApiClient.delete(`/sections/${sectionId}`);
  },

  createContent: async (
    sectionId: number,
    data: {
      type: string;
      title: string;
      description?: string;
      orderIndex?: number;
      isMandatory?: boolean;
      metadata?: any;
    }
  ): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/sections/${sectionId}/content`, {
      type: data.type,
      title: data.title,
      description: data.description || "",
      order_index: data.orderIndex ?? 0,
      is_mandatory: data.isMandatory ?? true,
      metadata: data.metadata || {}
    });
  },

  getTestCases: async (labId: number): Promise<SuccessResponse<any[]>> => {
    return labApiClient.get<SuccessResponse<any[]>>(`/labs/${labId}/test-cases`);
  },

  createTestCase: async (labId: number, data: any): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/test-cases`, data);
  },

  deleteTestCase: async (id: number): Promise<void> => {
    return labApiClient.delete(`/test-cases/${id}`);
  },

  bulkCreateTestCases: async (labId: number, testCases: any[]): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/test-cases/bulk`, {
      test_cases: testCases
    });
  },
};
