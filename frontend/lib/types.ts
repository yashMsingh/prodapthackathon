/**
 * Core Data Contracts for InboxAI Frontend
 * Mirrors the target backend schemas with forward-compatible AI fields.
 */

// ---------------------------------------------------------------------------
// 1. Backend / LLM Schemas (Mirroring backend/app/models/schemas.py)
// ---------------------------------------------------------------------------

export interface BackendEmailInput {
  id?: string | null;
  subject: string;
  sender: string;
  recipient?: string | null;
  body: string;
  date?: string | null;
  thread_id?: string | null;
}

export interface BackendStyleExample {
  subject: string;
  body: string;
}

export interface BackendPriorityResult {
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface BackendTaskItem {
  task: string;
  deadline?: string | null;
  assigned_to?: string | null;
}

export interface BackendDeepAnalysisResult {
  summary: string;
  tasks: BackendTaskItem[];
  draft: string;
}

export interface BackendEmailAnalysisResult {
  email_id?: string | null;
  priority: BackendPriorityResult;
  summary?: string | null;
  tasks: BackendTaskItem[];
  draft?: string | null;
}

export interface BackendAnalyseRequest {
  email: BackendEmailInput;
  style_examples?: BackendStyleExample[];
}

export interface BackendAnalyseResponse {
  email_id?: string | null;
  priority: BackendPriorityResult;
  summary?: string | null;
  tasks: BackendTaskItem[];
  draft?: string | null;
}

export interface BackendTaskExtractionRequest {
  email: BackendEmailInput;
}

export interface BackendTaskExtractionResponse {
  email_id?: string | null;
  tasks: BackendTaskItem[];
}

export interface BackendDraftRequest {
  email: BackendEmailInput;
  style_examples?: BackendStyleExample[];
}

export interface BackendDraftResponse {
  email_id?: string | null;
  draft: string;
}

// ---------------------------------------------------------------------------
// 2. Frontend Presentation Contracts
// ---------------------------------------------------------------------------

export type PriorityLevel = "high" | "medium" | "low";

/**
 * Safely normalizes arbitrary priority strings to guaranteed PriorityLevel
 */
export function normalizePriority(p?: string | null): PriorityLevel {
  if (!p) return "low";
  const lower = p.toLowerCase().trim();
  if (lower === "high" || lower === "urgent" || lower === "p1") return "high";
  if (lower === "medium" || lower === "normal" || lower === "p2") return "medium";
  return "low";
}

export interface ExtractedTaskItem {
  task: string;
  deadline?: string | null;
  assignedTo?: string | null;
}

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  recipient?: string | null;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  priority: PriorityLevel;
  unread: boolean;
  tags?: string[];
  threadId?: string | null;
  // AI-augmented fields (all optional/nullable)
  aiSummary?: string | null;
  importanceReason?: string | null;
  extractedTasks?: (string | ExtractedTaskItem)[];
  suggestedReply?: string | null;
  deadline?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: PriorityLevel;
  sourceEmailId?: string;
}

export interface SearchResult {
  query: string;
  totalMatches: number;
  results: Email[];
}

export interface DraftPayload {
  recipient: string;
  subject: string;
  context?: string;
  tone?: "professional" | "casual" | "concise";
}

export interface DraftResponse {
  status: string;
  suggestedBody?: string;
  confidenceScore?: number;
}

export interface WeatherContext {
  status: string;
  location?: string;
  temperature?: number;
  condition?: string;
  summary?: string;
  meetingRecommendation?: string;
}

export interface ApiStatus {
  status: string;
  service?: string;
}

export type InboxFilter = "all" | "unread" | "high";

/**
 * Reusable helper to safely extract display string from task item
 */
export function getTaskDisplayText(task: string | ExtractedTaskItem | BackendTaskItem): string {
  if (typeof task === "string") {
    return task;
  }
  return task.task || "";
}

/**
 * Reusable helper to safely extract deadline from task item
 */
export function getTaskDeadline(task: string | ExtractedTaskItem | BackendTaskItem): string | null {
  if (typeof task === "string") {
    return null;
  }
  return task.deadline || null;
}
