'use client';

import Link from 'next/link';
import type { TaskItem } from '@/lib/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: TaskItem;
}

function formatDeadline(iso: string): { label: string; isOverdue: boolean; isSoon: boolean } {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return { label: 'Overdue', isOverdue: true, isSoon: false };
  if (diffDays === 1) return { label: 'Due Tomorrow', isOverdue: false, isSoon: true };
  if (diffDays <= 3) return { label: `Due in ${diffDays}d`, isOverdue: false, isSoon: true };
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isSoon: false,
  };
}

function getAvatarColor(str: string): string {
  const colors = ['#7c3aed', '#6d28d9', '#db2777', '#0891b2', '#059669', '#d97706'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const priorityChips: Record<string, string> = {
  urgent: 'chip chip-urgent',
  high: 'chip chip-high',
  normal: 'chip chip-normal',
  low: 'chip chip-low',
};

export default function TaskCard({ task }: TaskCardProps) {
  const deadline = formatDeadline(task.deadline);
  const avatarColor = getAvatarColor(task.assignee.name);

  return (
    <article className={`${styles.card} anim-fade-in`} aria-label={`Task: ${task.title}`}>
      {/* Priority + Assignee */}
      <div className={styles.topRow}>
        <span className={priorityChips[task.priority] ?? 'chip chip-normal'}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <div
          className={styles.assignee}
          style={{ background: task.assignee.avatar === 'ME' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : avatarColor }}
          title={task.assignee.name}
        >
          {task.assignee.avatar}
        </div>
      </div>

      {/* Title */}
      <h3 className={styles.title}>{task.title}</h3>

      {/* Description */}
      <p className={styles.description}>{task.description}</p>

      {/* Footer */}
      <div className={styles.footer}>
        <span
          className={`${styles.deadline} ${deadline.isOverdue ? styles.overdue : ''} ${deadline.isSoon ? styles.soon : ''}`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {deadline.label}
        </span>

        <Link
          href={`/thread/${task.sourceThreadId}`}
          className={styles.sourceLink}
          title={task.sourceThreadSubject}
          aria-label={`Source email: ${task.sourceThreadSubject}`}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
          </svg>
          Email
        </Link>
      </div>
    </article>
  );
}
