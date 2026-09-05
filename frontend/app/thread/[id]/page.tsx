'use client';

import { useEffect, useState } from 'react';
import { getThread, getDraft } from '@/lib/api';
import type { ThreadDetail, DraftResponse } from '@/lib/types';
import ThreadHeader from '@/components/thread/ThreadHeader';
import MessageBubble from '@/components/thread/MessageBubble';
import AISummaryPanel from '@/components/thread/AISummaryPanel';
import ReplyDrawer from '@/components/thread/ReplyDrawer';
import TopBar from '@/components/shell/TopBar';
import styles from './thread.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ThreadPage({ params }: Props) {
  const [id, setId] = useState<string>('');
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getThread(id)
      .then(setThread)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDraftReply = async () => {
    setDrawerOpen(true);
    if (!draft && id) {
      setDraftLoading(true);
      try {
        const d = await getDraft(id);
        setDraft(d);
      } finally {
        setDraftLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Loading thread…" />
        <div className={styles.loadingScreen}>
          <div className={styles.loadingDots}>
            <span /><span /><span />
          </div>
        </div>
      </>
    );
  }

  if (!thread) {
    return (
      <>
        <TopBar title="Thread not found" />
        <div className={styles.notFound}>
          <span>404</span>
          <p>This email thread doesn't exist in the mock data.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Thread" subtitle={thread.subject} />
      <div className={styles.layout}>
        {/* Messages column */}
        <div className={styles.messagesCol}>
          <ThreadHeader thread={thread} onDraftReply={handleDraftReply} />
          <div className={styles.messages}>
            {thread.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.from.email === 'me@company.com'}
              />
            ))}
          </div>
        </div>

        {/* AI Summary panel */}
        {thread.aiSummary && (
          <AISummaryPanel
            summary={thread.aiSummary}
            onDraftReply={handleDraftReply}
          />
        )}
      </div>

      {/* Reply Drawer */}
      {drawerOpen && (
        <ReplyDrawer
          draft={draft}
          loading={draftLoading}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}
