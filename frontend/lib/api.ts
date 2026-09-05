import {
  Email,
  Task,
  SearchResult,
  ApiStatus,
} from "./types";
import {
  getMockEmails,
  getMockEmail,
  getMockThread,
  getMockTasks,
  getMockSearchResult,
} from "./mockAdapter";

/**
 * Centralized API Client for Backend Services.
 *
 * Architecture:
 * UI Components -> api.ts -> Live FastAPI Backend OR Isolated Mock Fallback
 *
 * Note on Backend Contract:
 * - As of Phase 3, backend/app/routers/emails.py and search.py are pending implementation
 *   in the backend repository branch.
 * - This client attempts live communication first. If the backend is unreachable or returns
 *   an error, it safely falls back to the isolated mock adapter when NEXT_PUBLIC_USE_MOCK_FALLBACK is enabled.
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const USE_MOCK_FALLBACK =
  process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== "false";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Internal reusable HTTP request helper
 */
async function request<T>(
  endpoint: string,
  options?: RequestOptions & RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `API request to ${endpoint} failed with status ${response.status}`,
        response.status,
        endpoint
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Network error or backend unavailable";
    throw new ApiError(message, undefined, endpoint);
  }
}

/**
 * GET /health — Liveness & backend health status
 */
export async function getBackendHealth(
  options?: RequestOptions
): Promise<ApiStatus> {
  try {
    return await request<ApiStatus>("/health", options);
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      return { status: "offline", service: "InboxAI Local Fallback" };
    }
    throw err;
  }
}

/**
 * GET /emails — Retrieve inbox emails
 */
export async function getEmails(options?: RequestOptions): Promise<Email[]> {
  try {
    return await request<Email[]>("/emails", options);
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      return await getMockEmails();
    }
    throw err;
  }
}

/**
 * GET /emails/{id} — Retrieve a single email
 */
export async function getEmail(
  id: string,
  options?: RequestOptions
): Promise<Email | null> {
  const safeId = encodeURIComponent(id.trim());
  try {
    return await request<Email>(`/emails/${safeId}`, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    if (USE_MOCK_FALLBACK) {
      return await getMockEmail(id);
    }
    throw err;
  }
}

/**
 * GET /emails?thread_id={id} — Retrieve thread messages
 */
export async function getThread(
  id: string,
  options?: RequestOptions
): Promise<Email[]> {
  const safeId = encodeURIComponent(id.trim());
  try {
    return await request<Email[]>(`/emails?thread_id=${safeId}`, options);
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      return await getMockThread(id);
    }
    throw err;
  }
}

/**
 * GET /search?q={query} — Search emails by semantic query or keyword
 */
export async function searchEmails(
  query: string,
  options?: RequestOptions
): Promise<SearchResult> {
  const safeQuery = encodeURIComponent(query.trim());
  try {
    return await request<SearchResult>(`/search?q=${safeQuery}`, options);
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      return await getMockSearchResult(query);
    }
    throw err;
  }
}

/**
 * GET /tasks — Retrieve extracted actionable tasks
 */
export async function getTasks(options?: RequestOptions): Promise<Task[]> {
  try {
    return await request<Task[]>("/tasks", options);
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      return await getMockTasks();
    }
    throw err;
  }
}
