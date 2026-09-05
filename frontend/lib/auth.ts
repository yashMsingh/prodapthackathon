// ─────────────────────────────────────────────
// Token Storage (localStorage + cookie for middleware)
// ─────────────────────────────────────────────
const TOKEN_KEY = 'inboxai_token';
const USER_KEY = 'inboxai_user';

// A non-expiring mock JWT payload (header.payload.sig — not verified)
const MOCK_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' + // header
  '.eyJlbWFpbCI6ImRlbW9AaW5ib3hhaS5hcHAiLCJuYW1lIjoiRGVtbyBVc2VyIiwicGljdHVyZSI6IiIsImV4cCI6OTk5OTk5OTk5OX0' + // payload
  '.mock_signature_not_verified'; // sig

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also set a cookie so Next.js middleware can read it server-side
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Expire the cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function setUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// JWT decode (no verification — server validates)
// ─────────────────────────────────────────────
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 < Date.now();
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

// ─────────────────────────────────────────────
// Google OAuth initiation URL (→ backend)
// ─────────────────────────────────────────────
export function getGoogleAuthUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
  const redirectUri = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`
  );
  return `${base}/auth/google?redirect_uri=${redirectUri}`;
}

// ─────────────────────────────────────────────
// Mock / Dev bypass — creates a fake session without a backend
// ─────────────────────────────────────────────
export function createMockSession(): void {
  const mockUser: AuthUser = {
    name: 'Yash Singh',
    email: 'yash@company.com',
    picture: '',
  };
  setToken(MOCK_JWT);
  setUser(mockUser);
}
