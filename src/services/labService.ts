import { labApiClient } from "./labApiClient";
import type {
  ExperimentDefinition,
  EvidenceEvent,
  ExperimentRun,
  ExperimentRunSummary,
  ExperimentTrial,
  Lab,
  LabEnrollment,
  LabVersion,
  LabVersionValidation,
} from "@/types";

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
    creatorName: raw.creator_name,
    creatorEmail: raw.creator_email,
    enrollmentCount: raw.enrollment_count,
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

// Helper to map backend snake_case SubmissionResponse to frontend camelCase LabSubmission
const mapSubmission = (raw: any): any => {
  if (!raw) return raw;
  return {
    id: raw.id,
    labId: raw.lab_id,
    userId: raw.user_id,
    language: raw.language,
    code: raw.code,
    status: raw.status,
    score: raw.score,
    maxScore: raw.max_score,
    passedTests: raw.passed_tests,
    totalTests: raw.total_tests,
    runtimeMs: raw.runtime_ms,
    memoryKb: raw.memory_kb,
    slurmJobId: raw.slurm_job_id,
    compilerOutput: raw.compiler_output,
    submittedAt: raw.submitted_at,
  };
};

// Helper to map backend snake_case RunResultResponse to frontend camelCase RunResult
const mapRunResult = (raw: any): any => {
  if (!raw) return raw;
  return {
    compilerOutput: raw.compiler_output,
    totalRuntimeMs: raw.total_runtime_ms,
    status: raw.status,
    testResults: (raw.test_results || []).map((tr: any) => ({
      testCaseId: tr.test_case_id,
      status: tr.status,
      actualOutput: tr.actual_output,
      runtimeMs: tr.runtime_ms,
      memoryKb: tr.memory_kb,
      isSample: tr.is_sample,
    })),
  };
};

const mapDefinition = (raw: any): ExperimentDefinition => ({
  domain: raw.domain,
  inquiryLevel: raw.inquiry_level,
  workflowSchemaVersion: raw.workflow_schema_version,
  modelVersion: raw.model_version,
  learningObjectives: raw.learning_objectives || [],
  config: raw.config || {},
  nodes: (raw.nodes || []).map((node: any) => ({
    key: node.key,
    type: node.type,
    title: node.title,
    config: node.config || {},
    requiredEvidence: node.required_evidence || [],
    orderHint: node.order_hint,
  })),
  edges: (raw.edges || []).map((edge: any) => ({
    from: edge.from,
    to: edge.to,
    conditionExpression: edge.condition_expression,
    priority: edge.priority,
  })),
  variables: (raw.variables || []).map((variable: any) => ({
    key: variable.key,
    displayName: variable.display_name,
    role: variable.role,
    dataType: variable.data_type,
    unit: variable.unit,
    minValue: variable.min_value,
    maxValue: variable.max_value,
    defaultValue: variable.default_value,
    sourceId: variable.source_id,
  })),
});

const mapLabVersion = (raw: any): LabVersion => ({
  id: raw.id,
  labId: raw.lab_id,
  versionNumber: raw.version_number,
  status: raw.status,
  definitionHash: raw.definition_hash,
  definition: mapDefinition(raw.definition || {}),
  createdBy: raw.created_by,
  validatedAt: raw.validated_at,
  publishedAt: raw.published_at,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
});

const mapExperimentRun = (raw: any): ExperimentRun => ({
  id: raw.id,
  labId: raw.lab_id,
  labVersionId: raw.lab_version_id,
  labVersionNumber: raw.lab_version_number,
  userId: raw.user_id,
  status: raw.status,
  currentNodeKey: raw.current_node_key,
  lastEventSeq: raw.last_event_seq,
  startedAt: raw.started_at,
  endedAt: raw.ended_at,
  updatedAt: raw.updated_at,
});

const mapRunSummary = (raw: any): ExperimentRunSummary => ({
  ...mapExperimentRun(raw),
  learnerName: raw.learner_name,
  learnerEmail: raw.learner_email,
  trialCount: raw.trial_count || 0,
});

const mapTrial = (raw: any): ExperimentTrial => ({
  id: raw.id,
  runId: raw.run_id,
  trialNumber: raw.trial_number,
  seed: raw.seed,
  modelVersion: raw.model_version,
  configSnapshot: raw.config_snapshot || {},
  status: raw.status,
  createdAt: raw.created_at,
});

const mapEvidence = (raw: any): EvidenceEvent => ({
  eventId: raw.event_id,
  clientEventId: raw.client_event_id,
  runId: raw.run_id,
  trialId: raw.trial_id,
  seqNo: raw.seq_no,
  verb: raw.verb,
  object: raw.object,
  result: raw.result || {},
  context: raw.context || {},
  occurredAt: raw.occurred_at,
});

const definitionPayload = (definition: ExperimentDefinition) => ({
  domain: definition.domain,
  inquiry_level: definition.inquiryLevel,
  workflow_schema_version: definition.workflowSchemaVersion,
  model_version: definition.modelVersion,
  learning_objectives: definition.learningObjectives,
  config: definition.config,
  nodes: definition.nodes.map(node => ({
    key: node.key,
    type: node.type,
    title: node.title,
    config: node.config,
    required_evidence: node.requiredEvidence,
    order_hint: node.orderHint,
  })),
  edges: definition.edges.map(edge => ({
    from: edge.from,
    to: edge.to,
    condition_expression: edge.conditionExpression,
    priority: edge.priority,
  })),
  variables: definition.variables.map(variable => ({
    key: variable.key,
    display_name: variable.displayName,
    role: variable.role,
    data_type: variable.dataType,
    unit: variable.unit,
    min_value: variable.minValue,
    max_value: variable.maxValue,
    default_value: variable.defaultValue,
    source_id: variable.sourceId,
  })),
});

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

  getManagedLabs: async (params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ListResponse<Lab>> => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
    const res = await labApiClient.get<ListResponse<any>>(`/labs/manage${query.size ? `?${query.toString()}` : ""}`);
    return { ...res, items: (res.items || []).map(mapLab) };
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
    const res = await labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/run`, data);
    return {
      ...res,
      data: mapRunResult(res.data),
    };
  },

  submitCode: async (labId: number, data: { language: string; code: string }): Promise<SuccessResponse<any>> => {
    const res = await labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/submit`, data);
    return {
      ...res,
      data: mapSubmission(res.data),
    };
  },

  submitHPCJob: async (labId: number, data: {
    job_name?: string;
    script_content: string;
    num_nodes?: number;
    num_tasks?: number;
    cpus_per_task?: number;
    memory_mb?: number;
    gpu_count?: number;
    max_time?: string;
  }): Promise<SuccessResponse<any>> => {
    const res = await labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/hpc-jobs`, data);
    return { ...res, data: mapSubmission(res.data) };
  },

  getMySubmissions: async (labId: number, page = 1, pageSize = 20): Promise<any> => {
    const res = await labApiClient.get<any>(`/labs/${labId}/submissions/my?page=${page}&page_size=${pageSize}`);
    return {
      ...res,
      items: (res.items || []).map(mapSubmission),
    };
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

  listLabVersions: async (labId: number): Promise<SuccessResponse<LabVersion[]>> => {
    const res = await labApiClient.get<SuccessResponse<any[]>>(`/labs/${labId}/versions`);
    return { ...res, data: (res.data || []).map(mapLabVersion) };
  },

  createLabVersion: async (
    labId: number,
    definition: ExperimentDefinition
  ): Promise<SuccessResponse<LabVersion>> => {
    const res = await labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/versions`, {
      definition: definitionPayload(definition),
    });
    return { ...res, data: mapLabVersion(res.data) };
  },

  validateLabVersion: async (versionId: number): Promise<SuccessResponse<LabVersionValidation>> => {
    return labApiClient.post<SuccessResponse<LabVersionValidation>>(
      `/lab-versions/${versionId}/validate`,
      {}
    );
  },

  publishLabVersion: async (versionId: number): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/lab-versions/${versionId}/publish`, {});
  },

  getPublishedLabVersion: async (labId: number): Promise<SuccessResponse<LabVersion>> => {
    const res = await labApiClient.get<SuccessResponse<any>>(`/labs/${labId}/published-version`);
    return { ...res, data: mapLabVersion(res.data) };
  },

  createExperimentRun: async (versionId: number, idempotencyKey: string): Promise<SuccessResponse<ExperimentRun>> => {
    const res = await labApiClient.post<SuccessResponse<any>>(`/lab-versions/${versionId}/runs`, {
      idempotency_key: idempotencyKey,
    });
    return { ...res, data: mapExperimentRun(res.data) };
  },

  getExperimentRun: async (runId: number): Promise<SuccessResponse<ExperimentRun>> => {
    const res = await labApiClient.get<SuccessResponse<any>>(`/runs/${runId}`);
    return { ...res, data: mapExperimentRun(res.data) };
  },

  createExperimentTrial: async (
    runId: number,
    configSnapshot: Record<string, any>
  ): Promise<SuccessResponse<ExperimentTrial>> => {
    const res = await labApiClient.post<SuccessResponse<any>>(`/runs/${runId}/trials`, {
      config_snapshot: configSnapshot,
    });
    return { ...res, data: mapTrial(res.data) };
  },

  appendExperimentEvidence: async (
    runId: number,
    event: {
      clientEventId: string;
      trialId?: number;
      workflowNodeKey: string;
      verb: string;
      object: { type: string; id: string };
      result: Record<string, any>;
      context?: Record<string, any>;
      simTimeMs?: number;
    }
  ): Promise<SuccessResponse<EvidenceEvent>> => {
    const res = await labApiClient.post<SuccessResponse<any>>(`/runs/${runId}/evidence`, {
      client_event_id: event.clientEventId,
      trial_id: event.trialId,
      workflow_node_key: event.workflowNodeKey,
      verb: event.verb,
      object: event.object,
      result: event.result,
      context: event.context || {},
      sim_time_ms: event.simTimeMs,
    });
    return { ...res, data: mapEvidence(res.data) };
  },

  getExperimentEvidence: async (runId: number): Promise<SuccessResponse<EvidenceEvent[]>> => {
    const res = await labApiClient.get<SuccessResponse<any[]>>(`/runs/${runId}/events?after_seq=0&limit=500`);
    return { ...res, data: (res.data || []).map(mapEvidence) };
  },

  completeExperimentRun: async (runId: number): Promise<SuccessResponse<ExperimentRun>> => {
    const res = await labApiClient.post<SuccessResponse<any>>(`/runs/${runId}/complete`, {});
    return { ...res, data: mapExperimentRun(res.data) };
  },

  listExperimentRuns: async (
    labId: number,
    status = "",
    page = 1,
    pageSize = 50
  ): Promise<ListResponse<ExperimentRunSummary>> => {
    const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (status) query.set("status", status);
    const res = await labApiClient.get<ListResponse<any>>(`/labs/${labId}/runs?${query.toString()}`);
    return { ...res, items: (res.items || []).map(mapRunSummary) };
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

  updateContent: async (
    contentId: number,
    data: {
      title?: string;
      description?: string;
      orderIndex?: number;
      isMandatory?: boolean;
      metadata?: any;
    }
  ): Promise<SuccessResponse<any>> => {
    return labApiClient.put<SuccessResponse<any>>(`/content/${contentId}`, {
      title: data.title,
      description: data.description,
      order_index: data.orderIndex,
      is_mandatory: data.isMandatory,
      metadata: data.metadata
    });
  },

  deleteContent: async (contentId: number): Promise<void> => {
    return labApiClient.delete(`/content/${contentId}`);
  },

  getTestCases: async (labId: number): Promise<SuccessResponse<any[]>> => {
    return labApiClient.get<SuccessResponse<any[]>>(`/labs/${labId}/test-cases`);
  },

  createTestCase: async (labId: number, data: any): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/test-cases`, data);
  },

  updateTestCase: async (id: number, data: any): Promise<SuccessResponse<any>> => {
    const payload = {
      name: data.name,
      order_index: data.orderIndex,
      is_sample: data.isSample,
      is_hidden: data.isHidden,
      weight: data.weight,
      input: data.input,
      expected: data.expected,
      time_limit_ms: data.timeLimitMs,
      memory_limit_mb: data.memoryLimitMB,
      explanation: data.explanation
    };
    return labApiClient.put<SuccessResponse<any>>(`/test-cases/${id}`, payload);
  },

  deleteTestCase: async (id: number): Promise<void> => {
    return labApiClient.delete(`/test-cases/${id}`);
  },

  bulkCreateTestCases: async (labId: number, testCases: any[]): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/test-cases/bulk`, {
      test_cases: testCases
    });
  },

  startSession: async (labId: number): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/session/start`, {});
  },

  stopSession: async (labId: number): Promise<SuccessResponse<any>> => {
    return labApiClient.post<SuccessResponse<any>>(`/labs/${labId}/session/stop`, {});
  },
};
