'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function getAvatarColor(str: string): string {
  const colors = ['#7c3aed', '#6d28d9', '#db2777', '#0891b2', '#059669', '#d97706'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatBody(body: string): string {
  return body
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [expanded, setExpanded] = useState(true);
  const avatarColor = getAvatarColor(message.from.email);
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <article
      className={`${styles.bubble} ${isOwn ? styles.own : ''} anim-fade-in`}
      aria-label={`Message from ${message.from.name}`}
    >
      <div className={styles.avatarCol}>
        <div
          className={styles.avatar}
          style={{ background: isOwn ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : avatarColor }}
        >
          {message.from.avatar}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={`${styles.name} ${isOwn ? styles.ownName : ''}`}>
            {isOwn ? 'You' : message.from.name}
          </span>
          <span className={styles.email}>{message.from.email}</span>
          <span className={styles.time}>{time}</span>
          <button
            className={styles.toggle}
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse message' : 'Expand message'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? 'rotate(0)' : 'rotate(-90deg)', transition: '150ms ease' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {expanded && (
          <div
            className={styles.text}
            dangerouslySetInnerHTML={{ __html: formatBody(message.body) }}
          />
        )}
        {!expanded && (
          <div className={styles.collapsed}>Message collapsed — click to expand</div>
        )}
      </div>
    </article>
  );
}
