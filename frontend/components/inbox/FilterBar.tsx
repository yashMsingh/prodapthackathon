'use client';

import type { InboxFilter } from '@/lib/types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  filter: InboxFilter;
  onChange: (f: InboxFilter) => void;
  totalCount: number;
  unreadCount: number;
}

const TABS: { key: InboxFilter['tab']; label: string }[] = [
  { key: 'all', label: 'All Mail' },
  { key: 'important', label: 'Important' },
  { key: 'unread', label: 'Unread' },
  { key: 'has_tasks', label: 'Has Tasks' },
];

const SORTS: { key: InboxFilter['sort']; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'importance', label: 'Importance' },
];

export default function FilterBar({ filter, onChange, totalCount, unreadCount }: FilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.tabs} role="tablist" aria-label="Inbox filter">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`inbox-tab-${tab.key}`}
            role="tab"
            aria-selected={filter.tab === tab.key}
            className={`${styles.tab} ${filter.tab === tab.key ? styles.active : ''}`}
            onClick={() => onChange({ ...filter, tab: tab.key })}
          >
            {tab.label}
            {tab.key === 'all' && (
              <span className={styles.tabCount}>{totalCount}</span>
            )}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className={styles.tabBadge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.sortRow}>
        <label className={styles.sortLabel} htmlFor="inbox-sort">Sort:</label>
        <select
          id="inbox-sort"
          className={styles.sortSelect}
          value={filter.sort}
          onChange={(e) => onChange({ ...filter, sort: e.target.value as InboxFilter['sort'] })}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
