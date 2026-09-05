'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getGoogleAuthUrl, isAuthenticated, createMockSession } from '@/lib/auth';
import styles from './login.module.css';

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const FEATURES = [
  {
    icon: '✦',
    title: 'AI Thread Summaries',
    desc: 'Instantly understand long email chains without reading every message.',
  },
  {
    icon: '◎',
    title: 'Task & Deadline Extraction',
    desc: 'AI spots action items and deadlines buried in your emails.',
  },
  {
    icon: '⟡',
    title: 'Smart Reply Drafts',
    desc: 'Context-aware draft replies generated in your tone.',
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, setAuthToken } = useAuth();
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated()) {
      router.replace('/inbox');
    }
    const err = searchParams.get('error');
    if (err) {
      const msgs: Record<string, string> = {
        auth_failed: 'Sign-in was cancelled or failed. Please try again.',
        no_token: 'No token received from server.',
        validation_failed: 'Could not verify your account. Please try again.',
      };
      setAuthError(msgs[err] ?? 'Something went wrong. Please try again.');
    }
  }, [isLoading, router, searchParams]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);

    if (IS_MOCK) {
      // ── Dev / Demo mode ──────────────────────────────────────
      // No backend needed. Create a local session and go straight to inbox.
      createMockSession();
      // Give AuthProvider a moment to pick up the new token via cookie
      await new Promise((r) => setTimeout(r, 300));
      router.replace('/inbox');
      return;
    }

    // ── Production: redirect to backend OAuth ─────────────────
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} aria-hidden="true" />
      <div className={styles.bgGlow2} aria-hidden="true" />

      <div className={styles.layout}>
        {/* Left — branding + features */}
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.logoMark}>✦</div>
            <span className={styles.logoName}>InboxAI</span>
            <span className={styles.logoBeta}>beta</span>
          </div>

          <div className={styles.headline}>
            <h1 className={styles.h1}>
              Your inbox,<br />
              <span className={styles.h1Accent}>supercharged by AI</span>
            </h1>
            <p className={styles.tagline}>
              Stop drowning in email. InboxAI reads, summarises, and acts on your behalf — so you can focus on what matters.
            </p>
          </div>

          <div className={styles.features}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureRow}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — sign-in card */}
        <div className={styles.right}>
          <div className={styles.card} role="main">
            <div className={styles.cardTop}>
              <div className={styles.cardLogoMark}>✦</div>
              <h2 className={styles.cardTitle}>Welcome back</h2>
              <p className={styles.cardSubtitle}>
                Sign in with Google to access your AI-powered inbox
              </p>
            </div>

            {IS_MOCK && (
              <div className={styles.demoBanner}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Demo mode — shows mock email data
              </div>
            )}

            {authError && (
              <div className={styles.errorBanner} role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {authError}
              </div>
            )}

            <button
              id="google-signin-btn"
              className={styles.googleBtn}
              onClick={handleGoogleSignIn}
              disabled={signingIn || isLoading}
              aria-label="Sign in with Google"
            >
              {signingIn ? (
                <>
                  <div className={styles.btnSpinner} />
                  <span>{IS_MOCK ? 'Opening inbox…' : 'Redirecting to Google…'}</span>
                </>
              ) : (
                <>
                  <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>Gmail access required</span>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.permissions}>
              <div className={styles.permission}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Read your Gmail messages
              </div>
              <div className={styles.permission}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                AI summaries &amp; task extraction
              </div>
              <div className={styles.permission}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Draft AI-powered replies
              </div>
            </div>

            <p className={styles.privacy}>
              We never store your emails. All processing is done securely on your behalf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
