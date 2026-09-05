import { getToken, clearToken } from './auth';
import type {
  EmailThread,
  ThreadDetail,
  TasksResponse,
  DraftResponse,
  DraftsResponse,
  WeatherData,
  SearchResult,
} from './types';

// ─────────────────────────────────────────────
// Toggle: NEXT_PUBLIC_USE_MOCK=true → use local fixtures
// ─────────────────────────────────────────────
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

// ─────────────────────────────────────────────
// Authenticated fetch wrapper
// ─────────────────────────────────────────────
async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired or invalid — clear and redirect to login
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Mock loaders (Next.js dynamic import for JSON)
// ─────────────────────────────────────────────
async function loadMock<T>(filename: string): Promise<T> {
  const mod = await import(`../mock/${filename}`);
  return mod.default as T;
}

// ─────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────

/** Fetch the full inbox list of email threads */
export async function getInbox(): Promise<EmailThread[]> {
  if (USE_MOCK) return loadMock<EmailThread[]>('emails.mock.json');
  return authFetch<EmailThread[]>('/api/emails');
}

/** Fetch a single thread with full messages and AI summary */
export async function getThread(id: string): Promise<ThreadDetail | null> {
  if (USE_MOCK) {
    const data = await loadMock<{ threads: ThreadDetail[] }>('thread.mock.json');
    return data.threads.find((t) => t.id === id) ?? null;
  }
  return authFetch<ThreadDetail>(`/api/emails/${id}`);
}

/** Fetch all extracted tasks for the Kanban board */
export async function getTasks(): Promise<TasksResponse> {
  if (USE_MOCK) return loadMock<TasksResponse>('tasks.mock.json');
  return authFetch<TasksResponse>('/api/tasks');
}

/** Fetch an AI draft for a specific thread */
export async function getDraft(threadId: string): Promise<DraftResponse | null> {
  if (USE_MOCK) {
    const data = await loadMock<DraftsResponse>('draft.mock.json');
    return data.drafts.find((d) => d.threadId === threadId) ?? null;
  }
  return authFetch<DraftResponse>(`/api/draft/${threadId}`);
}

/** Fetch current weather data */
export async function getWeather(): Promise<WeatherData> {
  if (USE_MOCK) return loadMock<WeatherData>('weather.mock.json');
  return authFetch<WeatherData>('/api/weather');
}

/** Semantic search across emails, tasks, and contacts */
export async function search(query: string): Promise<SearchResult[]> {
  if (USE_MOCK) {
    const emails = await loadMock<EmailThread[]>('emails.mock.json');
    const q = query.toLowerCase();
    if (!q) return [];
    return emails
      .filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.snippet.toLowerCase().includes(q) ||
          e.participants.some((p) => p.name.toLowerCase().includes(q)),
      )
      .map((e) => ({
        id: e.id,
        type: 'email' as const,
        title: e.subject,
        snippet: e.snippet.slice(0, 120) + '...',
        relevanceScore: Math.random() * 0.4 + 0.6,
        timestamp: e.timestamp,
        sourceThreadId: e.id,
      }));
  }
  const params = new URLSearchParams({ q: query });
  return authFetch<SearchResult[]>(`/api/search?${params}`);
}
