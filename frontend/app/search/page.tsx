import type { Metadata } from 'next';
import { Suspense } from 'react';
import TopBar from '@/components/shell/TopBar';
import SearchPageComponent from '@/components/search/SearchPage';

export const metadata: Metadata = {
  title: 'Search — InboxAI',
  description: 'Semantic AI search across your emails, tasks, and contacts.',
};

function SearchFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: 'var(--text-muted)', fontSize: '14px' }}>
      Loading search…
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <TopBar title="Search" subtitle="Semantic AI search" />
      <div className="page-body">
        <Suspense fallback={<SearchFallback />}>
          <SearchPageComponent />
        </Suspense>
      </div>
    </>
  );
}
