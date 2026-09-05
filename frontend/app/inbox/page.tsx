import type { Metadata } from 'next';
import { getInbox } from '@/lib/api';
import TopBar from '@/components/shell/TopBar';
import EmailList from '@/components/inbox/EmailList';

export const dynamic = 'force-dynamic'; // Never statically render — requires live backend + auth

export const metadata: Metadata = {
  title: 'Inbox — InboxAI',
  description: 'Your AI-powered inbox. Important emails surfaced, tasks extracted, and replies drafted for you.',
};

export default async function InboxPage() {
  const threads = await getInbox();
  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <>
      <TopBar
        title="Inbox"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <EmailList threads={threads} />
      </div>
    </>
  );
}
