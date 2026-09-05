'use client';

import Link from 'next/link';
import type { SearchResult } from '@/lib/types';
import styles from './SearchResult.module.css';

interface SearchResultProps {
  result: SearchResult;
  query: string;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className={styles.highlight}>{part}</mark> : part
  );
}

const typeIcon: Record<string, React.ReactNode> = {
  email: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  ),
  task: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  contact: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export default function SearchResultItem({ result, query }: SearchResultProps) {
  const score = Math.round(result.relevanceScore * 100);

  const content = (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.typeChip} ${styles[result.type]}`}>
          {typeIcon[result.type]}
          {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
        </span>
        <div className={styles.relevanceBar} title={`${score}% relevance`}>
          <div
            className={styles.relevanceFill}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={styles.relevanceScore}>{score}%</span>
      </div>
      <h3 className={styles.title}>{highlightMatch(result.title, query)}</h3>
      <p className={styles.snippet}>{highlightMatch(result.snippet, query)}</p>
    </div>
  );

  if (result.sourceThreadId) {
    return (
      <Link href={`/thread/${result.sourceThreadId}`} className={styles.link} aria-label={result.title}>
        {content}
      </Link>
    );
  }

  return <div className={styles.link}>{content}</div>;
}
