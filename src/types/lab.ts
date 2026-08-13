export type LabType = 'CODING' | 'HPC' | 'JUPYTER' | 'WORKSPACE' | 'DATABASE' | 'CUSTOM' | 'PLANT' | 'ROBOT';
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

export type InquiryLevel = 'STRUCTURED' | 'GUIDED' | 'OPEN_INQUIRY';
export type LabVersionStatus = 'DRAFT' | 'VALIDATED' | 'PUBLISHED' | 'SUPERSEDED';
export type ExperimentVariableRole = 'INDEPENDENT' | 'DEPENDENT' | 'CONTROLLED';
export type ExperimentDataType = 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'STRING';

export interface WorkflowNode {
  key: string;
  type: string;
  title: string;
  config: Record<string, any>;
  requiredEvidence: string[];
  orderHint: number;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  conditionExpression: string;
  priority: number;
}

export interface ExperimentVariable {
  key: string;
  displayName: string;
  role: ExperimentVariableRole;
  dataType: ExperimentDataType;
  unit: string;
  minValue?: number;
  maxValue?: number;
  defaultValue: any;
  sourceId: string;
}

export interface ExperimentDefinition {
  domain: 'PLANT' | 'ROBOT';
  inquiryLevel: InquiryLevel;
  workflowSchemaVersion: number;
  modelVersion: string;
  learningObjectives: string[];
  config: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: ExperimentVariable[];
}

export interface LabVersion {
  id: number;
  labId: number;
  versionNumber: number;
  status: LabVersionStatus;
  definitionHash: string;
  definition: ExperimentDefinition;
  createdBy: number;
  validatedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabValidationIssue {
  severity: 'ERROR' | 'WARNING';
  code: string;
  path: string;
  message: string;
}

export interface LabVersionValidation {
  valid: boolean;
  issues: LabValidationIssue[];
}

export interface ExperimentRun {
  id: number;
  labId: number;
  labVersionId: number;
  labVersionNumber: number;
  userId: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  currentNodeKey?: string;
  lastEventSeq: number;
  startedAt: string;
  endedAt?: string;
  updatedAt: string;
}

export interface ExperimentTrial {
  id: number;
  runId: number;
  trialNumber: number;
  seed: number;
  modelVersion: string;
  configSnapshot: Record<string, any>;
  status: string;
  createdAt: string;
}

export interface EvidenceEvent {
  eventId: string;
  clientEventId: string;
  runId: number;
  trialId?: number;
  seqNo: number;
  verb: string;
  object: { type: string; id: string };
  result: Record<string, any>;
  context: Record<string, any>;
  occurredAt: string;
}

export interface StemTrialResult {
  trialId: number;
  trialNumber: number;
  seed: number;
  engineVersion: string;
  domain: 'PLANT' | 'ROBOT';
  xLabel: string;
  yLabel: string;
  points: Array<{ x: number; y: number }>;
  summary: string;
  config: Record<string, number>;
}
