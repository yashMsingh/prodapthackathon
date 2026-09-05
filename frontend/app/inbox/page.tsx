"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Email, InboxFilter, normalizePriority } from "@/lib/types";
import { getEmails } from "@/lib/api";
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
  const [mobileDetailActive, setMobileDetailActive] = useState(false);

  const loadEmails = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Centralized API client: requests live backend or isolated mock fallback
      const data = await getEmails();
      setEmails(data);
      if (data.length > 0) {
        setSelectedEmail((prev) => {
          if (!prev) return data[0];
          // Keep current selection if still present in fresh data
          const match = data.find((e) => e.id === prev.id);
          return match || data[0];
        });
      } else {
        setSelectedEmail(null);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load your inbox. Please check your connection.";
      setError(message);
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
      result = result.filter((e) => normalizePriority(e.priority) === "high");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.sender.toLowerCase().includes(q) ||
          e.senderEmail.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          (e.tags && e.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [emails, filter, searchQuery]);

  const unreadCount = useMemo(
    () => emails.filter((e) => e.unread).length,
    [emails]
  );

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setMobileDetailActive(true);

    // Mark as read in local state
    if (email.unread) {
      setEmails((prev) =>
        prev.map((item) =>
          item.id === email.id ? { ...item, unread: false } : item
        )
      );
    }
  };

  const handleBackToList = () => {
    setMobileDetailActive(false);
  };

  return (
    <div className={`inbox-layout ${mobileDetailActive ? "mobile-preview-active" : ""}`}>
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
        <EmailPreview
          email={selectedEmail}
          onBackToList={handleBackToList}
        />
      </div>
    </div>
  );
}
