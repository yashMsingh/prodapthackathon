"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Email, InboxFilter } from "@/lib/types";
import { getEmails } from "@/lib/api";
import { getMockEmails } from "@/lib/mockAdapter";
import InboxHeader from "@/components/inbox/InboxHeader";
import EmailList from "@/components/inbox/EmailList";
import EmailPreview from "@/components/inbox/EmailPreview";
import LoadingState from "@/components/inbox/LoadingState";
import EmptyState from "@/components/inbox/EmptyState";
import ErrorState from "@/components/inbox/ErrorState";

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadEmails = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Attempt to consume real backend API
      const liveEmails = await getEmails();
      if (liveEmails && liveEmails.length > 0) {
        setEmails(liveEmails);
        setSelectedEmail((prev) => prev || liveEmails[0]);
      } else {
        // 2. If backend returns empty (e.g. baseline scaffolding), use isolated mock adapter
        const mockData = await getMockEmails();
        setEmails(mockData);
        setSelectedEmail((prev) => prev || mockData[0]);
      }
    } catch {
      // 3. If backend is offline or unreachable, fall back to isolated mock adapter
      try {
        const mockData = await getMockEmails();
        setEmails(mockData);
        setSelectedEmail((prev) => prev || mockData[0]);
      } catch (mockErr) {
        setError("Unable to load your inbox. Try again.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // Filtering & Search
  const filteredEmails = useMemo(() => {
    let result = emails;

    if (filter === "unread") {
      result = result.filter((e) => e.unread);
    } else if (filter === "high") {
      result = result.filter((e) => e.priority === "high");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.sender.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q)
      );
    }

    return result;
  }, [emails, filter, searchQuery]);

  const unreadCount = useMemo(() => emails.filter((e) => e.unread).length, [emails]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    // Mark as read in local state
    if (email.unread) {
      setEmails((prev) =>
        prev.map((item) => (item.id === email.id ? { ...item, unread: false } : item))
      );
    }
  };

  return (
    <div className="inbox-layout">
      {/* Left Panel: List View */}
      <div className="email-list-panel">
        <InboxHeader
          totalCount={emails.length}
          unreadCount={unreadCount}
          activeFilter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => loadEmails(true)}
          isRefreshing={isRefreshing}
        />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadEmails()} />
        ) : filteredEmails.length === 0 ? (
          <EmptyState
            message="Your inbox is clear."
            subtext={
              searchQuery
                ? `No emails match filter "${searchQuery}".`
                : "No emails in this view. Enjoy your inbox zero!"
            }
          />
        ) : (
          <EmailList
            emails={filteredEmails}
            selectedEmailId={selectedEmail?.id || null}
            onSelectEmail={handleSelectEmail}
          />
        )}
      </div>

      {/* Right Panel: Detail / Preview */}
      <div className="email-preview-panel">
        <EmailPreview email={selectedEmail} />
      </div>
    </div>
  );
}
