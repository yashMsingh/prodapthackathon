'use client';

import { useEffect, useState } from 'react';
import type { DraftResponse, DraftTone } from '@/lib/types';
import styles from './ReplyDrawer.module.css';

interface ReplyDrawerProps {
  draft: DraftResponse | null;
  loading: boolean;
  onClose: () => void;
}

const TONES: DraftTone[] = ['professional', 'friendly', 'concise'];

const toneLabels: Record<DraftTone, string> = {
  professional: '💼 Professional',
  friendly: '😊 Friendly',
  concise: '⚡ Concise',
};

export default function ReplyDrawer({ draft, loading, onClose }: ReplyDrawerProps) {
  const [body, setBody] = useState('');
  const [tone, setTone] = useState<DraftTone>('professional');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (draft) {
      setBody(draft.body);
      setTone(draft.tone);
    }
  }, [draft]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidence = draft ? Math.round(draft.confidence * 100) : 0;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        id="reply-drawer"
        className={`${styles.drawer} anim-slide-up`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Reply Drawer"
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.drawerTitle}>
              <span className={styles.titleDot} />
              AI Draft Reply
            </span>
            {draft && (
              <div className={styles.confidencePill} title="AI confidence score">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {confidence}% confidence
              </div>
            )}
          </div>
          <button id="drawer-close-btn" className={styles.closeBtn} onClick={onClose} aria-label="Close reply drawer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* To field */}
        {draft && (
          <div className={styles.toRow}>
            <span className={styles.toLabel}>To:</span>
            <div className={styles.toChips}>
              {draft.to.map((r) => (
                <span key={r.email} className={styles.toChip}>{r.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Tone Selector */}
        <div className={styles.toneRow}>
          <span className={styles.toneLabel}>Tone:</span>
          <div className={styles.tones}>
            {TONES.map((t) => (
              <button
                key={t}
                id={`tone-${t}`}
                className={`${styles.toneBtn} ${tone === t ? styles.toneActive : ''}`}
                onClick={() => setTone(t)}
              >
                {toneLabels[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className={styles.bodyWrapper}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots}>
                <span /><span /><span />
              </div>
              <p>AI is drafting your reply…</p>
            </div>
          ) : (
            <textarea
              id="draft-body-textarea"
              className={styles.textarea}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Draft reply body"
              rows={10}
            />
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button id="drawer-regenerate-btn" className={styles.secondaryBtn} onClick={onClose} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            Regenerate
          </button>
          <button id="drawer-copy-btn" className={styles.secondaryBtn} onClick={handleCopy} disabled={loading}>
            {copied ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Copy</>
            )}
          </button>
          <button id="drawer-send-btn" className={styles.sendBtn} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send Reply
          </button>
        </div>
      </div>
    </>
  );
}
