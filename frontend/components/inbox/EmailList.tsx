'use client';

import { useState } from 'react';
import type { EmailThread, InboxFilter } from '@/lib/types';
import EmailRow from './EmailRow';
import FilterBar from './FilterBar';
import styles from './EmailList.module.css';

interface EmailListProps {
  threads: EmailThread[];
}

export default function EmailList({ threads }: EmailListProps) {
  const [filter, setFilter] = useState<InboxFilter>({ tab: 'all', sort: 'newest' });

  const filtered = threads
    .filter((t) => {
      if (filter.tab === 'important') return t.importance === 'urgent' || t.importance === 'high';
      if (filter.tab === 'unread') return t.unread;
      if (filter.tab === 'has_tasks') return t.hasTasks;
      return true;
    })
    .sort((a, b) => {
      if (filter.sort === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (filter.sort === 'importance') {
        const order = { urgent: 0, high: 1, normal: 2 };
        return order[a.importance] - order[b.importance];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  return (
    <div className={styles.container}>
      <FilterBar filter={filter} onChange={setFilter} totalCount={threads.length} unreadCount={threads.filter((t) => t.unread).length} />
      <div className={styles.list} role="list">
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>No emails match this filter</p>
          </div>
        ) : (
          filtered.map((thread, i) => (
            <EmailRow key={thread.id} thread={thread} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
