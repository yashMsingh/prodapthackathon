"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Email } from "@/lib/types";
import { getEmail, getThread } from "@/lib/api";
import EmailPreview from "../inbox/EmailPreview";
import LoadingState from "../inbox/LoadingState";
import ErrorState from "../inbox/ErrorState";

interface ThreadViewProps {
  id: string;
}

export default function ThreadView({ id }: ThreadViewProps) {
  const [threadEmails, setThreadEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThread = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try to fetch thread directly by id
      let emails = await getThread(id);

      // 2. If getThread returns empty, try getEmail
      if (!emails || emails.length === 0) {
        const singleEmail = await getEmail(id);
        if (singleEmail) {
          // If the email has a threadId different from id, try fetching that thread
          if (singleEmail.threadId && singleEmail.threadId !== id) {
            const related = await getThread(singleEmail.threadId);
            emails = related && related.length > 0 ? related : [singleEmail];
          } else {
            emails = [singleEmail];
          }
        }
      }

      if (emails && emails.length > 0) {
        setThreadEmails(emails);
        setSelectedEmail(emails[emails.length - 1]); // Show latest email in thread by default
      } else {
        setError(`Email or thread "${id}" not found.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load thread.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href="/inbox"
          style={{
            fontSize: "0.875rem",
            color: "var(--primary)",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.4rem 0",
          }}
          aria-label="Return to Inbox"
        >
          <span>&larr;</span>
          <span>Back to Inbox</span>
        </Link>

        {threadEmails.length > 1 && (
          <span
            style={{
              fontSize: "0.75rem",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-secondary)",
              padding: "0.2rem 0.6rem",
              borderRadius: "var(--radius-full)",
              fontWeight: 600,
            }}
          >
            {threadEmails.length} messages in thread
          </span>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "2rem" }}>
          <LoadingState />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "2rem" }}>
          <ErrorState message={error} onRetry={loadThread} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Thread Message Tabs if multiple */}
          {threadEmails.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                padding: "0.25rem 0",
              }}
              role="tablist"
              aria-label="Thread messages"
            >
              {threadEmails.map((email, index) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedEmail(email)}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      backgroundColor: isSelected ? "var(--primary-subtle)" : "var(--bg-surface)",
                      color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                      fontSize: "0.8rem",
                      fontWeight: isSelected ? 600 : 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    #{index + 1} {email.sender} ({email.timestamp})
                  </button>
                );
              })}
            </div>
          )}

          {/* Render Detail */}
          <div className="card" style={{ padding: 0 }}>
            <EmailPreview email={selectedEmail} />
          </div>
        </div>
      )}
    </div>
  );
}
