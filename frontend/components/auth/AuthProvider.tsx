'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getToken,
  getStoredUser,
  setToken,
  setUser,
  clearToken,
  isAuthenticated,
  getGoogleAuthUrl,
  type AuthUser,
} from '@/lib/auth';

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  setAuthToken: (token: string, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const restore = async () => {
      if (!isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      // Always trust cached user in mock mode — no backend to validate against
      const cached = getStoredUser();
      if (cached) {
        setUserState(cached);
        setIsLoading(false);
        return;
      }

      // Production: validate token with backend /auth/me
      if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') {
        try {
          const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
          const res = await fetch(`${base}/auth/me`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (res.ok) {
            const me = await res.json() as AuthUser;
            setUser(me);
            setUserState(me);
          } else {
            clearToken();
          }
        } catch {
          clearToken();
        }
      } else {
        // Mock mode but no cached user — token exists without user data; clear it
        clearToken();
      }

      setIsLoading(false);
    };
    restore();
  }, []);

  const signIn = useCallback(() => {
    window.location.href = getGoogleAuthUrl();
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setUserState(null);
    window.location.href = '/login';
  }, []);

  const setAuthToken = useCallback((token: string, authUser: AuthUser) => {
    setToken(token);
    setUser(authUser);
    setUserState(authUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        signIn,
        signOut,
        setAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
