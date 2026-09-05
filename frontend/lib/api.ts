import { Email, Task, SearchResult, ApiStatus } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Centralized API Client for Backend Services.
 * Communicates strictly with verified backend endpoints.
 * Never embeds mock data directly in production API calls.
 */

export async function getBackendHealth(): Promise<ApiStatus> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

export async function getEmails(): Promise<Email[]> {
  const response = await fetch(`${API_BASE_URL}/emails`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch emails: ${response.statusText}`);
  }
  return response.json();
}

export async function getEmail(id: string): Promise<Email | null> {
  const response = await fetch(`${API_BASE_URL}/emails/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch email ${id}: ${response.statusText}`);
  }
  return response.json();
}

export async function searchEmails(query: string): Promise<SearchResult> {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  return response.json();
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }
  return response.json();
}

export async function getThread(id: string): Promise<Email[]> {
  const response = await fetch(`${API_BASE_URL}/emails?thread_id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch thread ${id}: ${response.statusText}`);
  }
  return response.json();
}
