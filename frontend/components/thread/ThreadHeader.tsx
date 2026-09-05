'use client';

import Link from 'next/link';
import type { ThreadDetail } from '@/lib/types';
import styles from './ThreadHeader.module.css';

interface ThreadHeaderProps {
  thread: ThreadDetail;
  onDraftReply: () => void;
}

export default function ThreadHeader({ thread, onDraftReply }: ThreadHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.topRow}>
        <Link href="/inbox" className={styles.backBtn} aria-label="Back to inbox">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Inbox
        </Link>

        <div className={styles.actions}>
          <button id="thread-draft-btn" className={styles.draftBtn} onClick={onDraftReply}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Draft Reply
          </button>
        </div>
      </div>

      <h2 className={styles.subject}>{thread.subject}</h2>

      <div className={styles.participants}>
        {thread.participants.map((p, i) => (
          <span key={p.email} className={styles.participant}>
            {p.name}{i < thread.participants.length - 1 ? ', ' : ''}
          </span>
        ))}
        <span className={styles.msgCount}>{thread.messages.length} messages</span>
      </div>
    </div>
  );
}
