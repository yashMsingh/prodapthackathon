'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './TopBar.module.css';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();
  const [focused, setFocused] = useState(false);

  const handleSearchClick = () => {
    router.push('/search');
  };

  return (
    <header className={styles.topbar} role="banner">
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>

      <div className={styles.center}>
        <button
          id="search-shortcut"
          className={`${styles.searchPill} ${focused ? styles.focused : ''}`}
          onClick={handleSearchClick}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Open search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search emails, tasks…</span>
          <span className={styles.kbd}>⌘K</span>
        </button>
      </div>

      <div className={styles.right}>
        {/* AI Status */}
        <div className={styles.aiStatus} title="AI Assistant active">
          <span className={styles.aiDot} />
          <span className={styles.aiLabel}>AI Active</span>
        </div>

        {/* Notifications */}
        <button id="notifications-btn" className={styles.iconBtn} aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className={styles.notifDot} />
        </button>

        {/* Avatar */}
        <div className={styles.avatar} title="Yash Singh">YS</div>
      </div>
    </header>
  );
}
