// ─────────────────────────────────────────────
// Participants & Identity
// ─────────────────────────────────────────────
export interface Participant {
  name: string;
  email: string;
  avatar: string; // 2-letter initials
}

// ─────────────────────────────────────────────
// Email / Thread
// ─────────────────────────────────────────────
export type ImportanceLabel = 'urgent' | 'high' | 'normal';

export interface EmailThread {
  id: string;
  subject: string;
  snippet: string;
  participants: Participant[];
  timestamp: string; // ISO 8601
  unread: boolean;
  messageCount: number;
  importance: ImportanceLabel;
  hasTasks: boolean;
  hasDraft: boolean;
  aiSummaryAvailable: boolean;
  labels: string[];
}

export interface Message {
  id: string;
  from: Participant;
  timestamp: string;
  body: string;
  isRead: boolean;
}

export interface ExtractedDeadline {
  task: string;
  deadline: string; // ISO 8601
  priority: ImportanceLabel;
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
  extractedDeadlines: ExtractedDeadline[];
  importance: ImportanceLabel;
  sentiment: 'positive' | 'negative' | 'neutral' | 'collaborative';
}

export interface ThreadDetail {
  id: string;
  subject: string;
  participants: Participant[];
  messages: Message[];
  aiSummary: AISummary;
}

// ─────────────────────────────────────────────
// Tasks / Kanban
// ─────────────────────────────────────────────
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string; // ISO 8601
  sourceThreadId: string;
  sourceThreadSubject: string;
  assignee: Pick<Participant, 'name' | 'avatar'>;
  createdAt: string;
}

export interface TasksResponse {
  tasks: TaskItem[];
}

// ─────────────────────────────────────────────
// Draft / Reply
// ─────────────────────────────────────────────
export type DraftTone = 'professional' | 'friendly' | 'concise';

export interface DraftResponse {
  id: string;
  threadId: string;
  subject: string;
  to: Pick<Participant, 'name' | 'email'>[];
  tone: DraftTone;
  confidence: number; // 0–1
  body: string;
  availableTones: DraftTone[];
  generatedAt: string;
}

export interface DraftsResponse {
  drafts: DraftResponse[];
}

// ─────────────────────────────────────────────
// Weather
// ─────────────────────────────────────────────
export interface WeatherForecastDay {
  day: string;
  high: number;
  low: number;
  icon: string;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windKph: number;
  icon: string;
  updatedAt: string;
  forecast: WeatherForecastDay[];
}

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────
export type SearchResultType = 'email' | 'task' | 'contact';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  relevanceScore: number; // 0–1
  timestamp?: string;
  sourceThreadId?: string;
}

export interface InboxFilter {
  tab: 'all' | 'important' | 'unread' | 'has_tasks';
  sort: 'newest' | 'oldest' | 'importance';
}
