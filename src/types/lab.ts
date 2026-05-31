export type LabType = 'CODING' | 'HPC' | 'JUPYTER' | 'WORKSPACE' | 'DATABASE' | 'CUSTOM';
export type LabLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
export type LabStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Lab {
  id: number;
  title: string;
  description: string;
  category: string;
  level: LabLevel;
  thumbnailUrl?: string;
  labType: LabType;
  status: LabStatus;
  runtimeConfig: Record<string, any>;
  maxSessionDurationMin: number;
  maxConcurrentSessions: number;
  maxSubmissions?: number;
  autoGrade: boolean;
  gradingConfig: Record<string, any>;
  startTime?: string;
  deadline?: string;
  allowLateSubmission: boolean;
  latePenaltyPercent: number;
  createdBy: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabEnrollment {
  id: number;
  labId: number;
  userId: number;
  status: string;
  enrolledAt: string;
  title?: string;
  labType?: LabType;
  level?: LabLevel;
  category?: string;
  thumbnailUrl?: string;
}

export interface LabTestCase {
  id: number;
  labId: number;
  name: string;
  orderIndex: number;
  isSample: boolean;
  isHidden: boolean;
  weight: number;
  input: string;
  expected: string;
  queryExpected?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  explanation?: string;
  createdAt: string;
}

export interface LabSubmission {
  id: number;
  labId: number;
  userId: number;
  sessionId?: number;
  language: string;
  code?: string;
  query?: string;
  filesSnapshot?: string;
  notebookKey?: string;
  scriptContent?: string;
  status: string;
  score: number;
  maxScore: number;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  memoryKb: number;
  submittedAt: string;
  gradedAt?: string;
}
