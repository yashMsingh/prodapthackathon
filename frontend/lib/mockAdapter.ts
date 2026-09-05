import { Email, Task, SearchResult, DraftResponse, WeatherContext } from "./types";
import mockEmails from "../mock/emails.mock.json";
import mockTasks from "../mock/tasks.mock.json";
import mockDraft from "../mock/draft.mock.json";
import mockWeather from "../mock/weather.mock.json";

/**
 * Isolated Mock Adapter for Frontend Testing & Offline Fallback.
 * Kept strictly isolated from production API client code in lib/api.ts.
 */

export async function getMockEmails(): Promise<Email[]> {
  return (mockEmails as unknown) as Email[];
}

export async function getMockEmail(id: string): Promise<Email | null> {
  const emails = (mockEmails as unknown) as Email[];
  const found = emails.find((e) => e.id === id);
  return found || null;
}

export async function getMockThread(threadIdOrEmailId: string): Promise<Email[]> {
  const emails = (mockEmails as unknown) as Email[];
  const thread = emails.filter(
    (e) => e.threadId === threadIdOrEmailId || e.id === threadIdOrEmailId
  );
  if (thread.length > 0) return thread;
  const single = emails.find((e) => e.id === threadIdOrEmailId);
  return single ? [single] : [];
}

export async function getMockTasks(): Promise<Task[]> {
  return mockTasks as Task[];
}

export async function getMockSearchResult(query: string): Promise<SearchResult> {
  const q = query.toLowerCase().trim();
  const all = (mockEmails as unknown) as Email[];
  const filtered = q
    ? all.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          e.sender.toLowerCase().includes(q)
      )
    : all;

  return {
    query,
    totalMatches: filtered.length,
    results: filtered,
  };
}

export async function getMockDraft(): Promise<DraftResponse> {
  return mockDraft as DraftResponse;
}

export async function getMockWeather(): Promise<WeatherContext> {
  return mockWeather as WeatherContext;
}
