'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import type { AuthUser } from '@/lib/auth';
import styles from './callback.module.css';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthToken } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      setStatus('error');
      setTimeout(() => router.push('/login?error=auth_failed'), 2500);
      return;
    }

    if (!token) {
      setErrorMsg('No authentication token received from server.');
      setStatus('error');
      setTimeout(() => router.push('/login?error=no_token'), 2500);
      return;
    }

    // Validate token with backend and fetch user info
    const validate = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
        const res = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Token validation failed');

        const user = await res.json() as AuthUser;
        setAuthToken(token, user);
        setStatus('success');
        setTimeout(() => router.push('/inbox'), 800);
      } catch (err) {
        console.error('Auth callback error:', err);
        setErrorMsg('Could not verify your identity. Please try again.');
        setStatus('error');
        setTimeout(() => router.push('/login?error=validation_failed'), 2500);
      }
    };

    validate();
  }, [searchParams, setAuthToken, router]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoMark}>✦</div>

        {status === 'loading' && (
          <>
            <div className={styles.spinnerRing} aria-label="Signing you in…" />
            <h1 className={styles.title}>Signing you in…</h1>
            <p className={styles.desc}>Verifying your Google account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className={styles.title}>Signed in!</h1>
            <p className={styles.desc}>Taking you to your inbox…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className={styles.title}>Authentication failed</h1>
            <p className={styles.desc}>{errorMsg}</p>
            <p className={styles.redirect}>Redirecting to login…</p>
          </>
        )}
      </div>
    </div>
  );
}
