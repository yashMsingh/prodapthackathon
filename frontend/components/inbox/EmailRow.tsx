'use client';

import Link from 'next/link';
import type { EmailThread } from '@/lib/types';
import styles from './EmailRow.module.css';

interface EmailRowProps {
  thread: EmailThread;
  index: number;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 24) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (diffH < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAvatarColor(str: string): string {
  const colors = [
    '#7c3aed', '#6d28d9', '#db2777', '#0891b2',
    '#059669', '#d97706', '#dc2626', '#7c3aed',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const importanceMeta: Record<string, { label: string; cls: string }> = {
  urgent: { label: 'Urgent', cls: 'badge-urgent' },
  high: { label: 'High', cls: 'badge-high' },
  normal: { label: '', cls: '' },
};

export default function EmailRow({ thread, index }: EmailRowProps) {
  const sender = thread.participants[0];
  const avatarColor = getAvatarColor(sender.email);
  const importance = importanceMeta[thread.importance];

  return (
    <Link
      href={`/thread/${thread.id}`}
      className={`${styles.row} ${thread.unread ? styles.unread : ''}`}
      style={{ animationDelay: `${index * 35}ms` }}
      role="listitem"
      aria-label={`Email: ${thread.subject}, from ${sender.name}`}
    >
      {/* Unread indicator bar */}
      {thread.unread && <div className={styles.unreadBar} />}

      {/* Avatar */}
      <div
        className={styles.avatar}
        style={{ background: avatarColor }}
        aria-hidden="true"
      >
        {sender.avatar}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.sender}>{sender.name}</span>
          <span className={styles.time}>{formatTime(thread.timestamp)}</span>
        </div>

        <div className={styles.subjectRow}>
          <span className={styles.subject}>{thread.subject}</span>
          {thread.messageCount > 1 && (
            <span className={styles.count}>{thread.messageCount}</span>
          )}
        </div>

        <div className={styles.bottomRow}>
          <span className={styles.snippet}>{thread.snippet}</span>
          <div className={styles.badges}>
            {importance.label && (
              <span className={`badge ${importance.cls}`} aria-label={`Importance: ${importance.label}`}>
                {importance.label}
              </span>
            )}
            {thread.aiSummaryAvailable && (
              <span className="badge badge-ai" aria-label="AI summary available">
                ✦ AI
              </span>
            )}
            {thread.hasTasks && (
              <span className={styles.taskBadge} aria-label="Has extracted tasks" title="Has tasks">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                Tasks
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
