'use client';

import { useState } from 'react';
import type { AISummary } from '@/lib/types';
import styles from './AISummaryPanel.module.css';

interface AISummaryPanelProps {
  summary: AISummary;
  onDraftReply: () => void;
}

const priorityMeta: Record<string, { cls: string; label: string }> = {
  urgent: { cls: 'badge-urgent', label: 'Urgent' },
  high: { cls: 'badge-high', label: 'High' },
  normal: { cls: 'badge-normal', label: 'Normal' },
};

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (diffDays <= 0) return `Overdue — ${formatted}`;
  if (diffDays === 1) return `Tomorrow — ${formatted}`;
  return `${diffDays}d — ${formatted}`;
}

export default function AISummaryPanel({ summary, onDraftReply }: AISummaryPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <aside className={`${styles.panel} anim-slide-right`} aria-label="AI Summary Panel">
      {/* Panel header */}
      <div className={styles.panelHeader}>
        <div className={styles.aiLabel}>
          <span className={styles.aiDot} />
          <span>AI Summary</span>
        </div>
        <button
          id="summary-panel-toggle"
          className={styles.toggleBtn}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Collapse AI summary panel' : 'Expand AI summary panel'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(0)' : 'rotate(180deg)', transition: '150ms ease' }}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      {open && (
        <>
          {/* Summary */}
          <section className={styles.section}>
            <p className={styles.summaryText}>{summary.summary}</p>
          </section>

          {/* Key points */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              Key Points
            </h3>
            <ul className={styles.keyPoints}>
              {summary.keyPoints.map((pt, i) => (
                <li key={i} className={styles.keyPoint}>{pt}</li>
              ))}
            </ul>
          </section>

          {/* Deadlines */}
          {summary.extractedDeadlines.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Deadlines & Tasks
              </h3>
              <div className={styles.deadlines}>
                {summary.extractedDeadlines.map((dl, i) => {
                  const meta = priorityMeta[dl.priority] ?? priorityMeta.normal;
                  return (
                    <div key={i} className={styles.deadline}>
                      <div className={styles.deadlineTop}>
                        <span className={`badge ${meta.cls}`}>{meta.label}</span>
                        <span className={styles.deadlineTime}>{formatDeadline(dl.deadline)}</span>
                      </div>
                      <p className={styles.deadlineTask}>{dl.task}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Draft CTA */}
          <div className={styles.ctaSection}>
            <button id="ai-draft-reply-btn" className={styles.ctaBtn} onClick={onDraftReply}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Draft AI Reply
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
