/**
 * Core Data Contracts for InboxAI Frontend
 * Mirrors the target backend schemas with forward-compatible AI fields.
 */

export type PriorityLevel = "high" | "medium" | "low";

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  priority: PriorityLevel;
  unread: boolean;
  tags?: string[];
  // AI-augmented fields
  aiSummary?: string;
  importanceReason?: string;
  extractedTasks?: string[];
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
