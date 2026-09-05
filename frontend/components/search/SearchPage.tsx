'use client';

import { useState, useEffect, useCallback } from 'react';
import { search } from '@/lib/api';
import type { SearchResult } from '@/lib/types';
import SearchResultItem from './SearchResult';
import styles from './SearchPage.module.css';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SUGGESTIONS = [
  'Q4 roadmap',
  'contract renewal',
  'AWS cost',
  'onboarding Zoe',
  'frontend architecture',
  'invoice payment',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await search(q);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  return (
    <div className={styles.page}>
      {/* Search input */}
      <div className={styles.searchBox}>
        <div className={styles.inputWrap}>
          <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="main-search-input"
            type="text"
            className={styles.input}
            placeholder="Search emails, tasks, contacts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search"
          />
          {loading && (
            <div className={styles.spinner} aria-label="Searching…">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                </path>
              </svg>
            </div>
          )}
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions */}
        {!query && (
          <div className={styles.suggestions}>
            <span className={styles.suggestLabel}>Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                id={`suggestion-${s.replace(/\s+/g, '-')}`}
                className={styles.suggestion}
                onClick={() => setQuery(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className={styles.resultsArea}>
        {query && !loading && results.length === 0 && (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🔍</span>
            <p>No results for <strong>"{query}"</strong></p>
            <span>Try different keywords or check spelling</span>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              <span className={styles.resultsQuery}>for "{query}"</span>
            </div>
            <div className={styles.results} role="list">
              {results.map((r, i) => (
                <div key={r.id} style={{ animationDelay: `${i * 40}ms` }} role="listitem">
                  <SearchResultItem result={r} query={query} />
                </div>
              ))}
            </div>
          </>
        )}

        {!query && results.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✦</div>
            <h2 className={styles.emptyTitle}>AI-Powered Search</h2>
            <p className={styles.emptyDesc}>
              Search across all your emails, extracted tasks, and contacts.<br />
              Results are ranked by semantic relevance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
