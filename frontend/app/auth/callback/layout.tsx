import { Suspense } from 'react';
import CallbackPage from './page';

// Wrap in Suspense since CallbackPage uses useSearchParams
export default function CallbackLayout() {
  return (
    <Suspense fallback={null}>
      <CallbackPage />
    </Suspense>
  );
}
