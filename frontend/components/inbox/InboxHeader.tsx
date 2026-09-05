"use client";

import React from "react";
import { InboxFilter } from "@/lib/types";

interface InboxHeaderProps {
  totalCount: number;
  unreadCount: number;
  activeFilter: InboxFilter;
  onFilterChange: (filter: InboxFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function InboxHeader({
  totalCount,
  unreadCount,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
}: InboxHeaderProps) {
  return (
    <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>Inbox</h1>
          <span style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-subtle)", color: "var(--text-secondary)", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontWeight: 600 }}>
            {unreadCount} unread / {totalCount} total
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            padding: "0.35rem 0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
          aria-label="Refresh Inbox"
        >
          <span style={{ display: "inline-block", transform: isRefreshing ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
            ↻
          </span>
          <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
        </button>
      </div>

      {/* Quick Search Field */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter messages or sender..."
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            fontSize: "0.825rem",
            backgroundColor: "var(--bg-app)",
          }}
          aria-label="Filter inbox emails"
        />
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }} role="tablist" aria-label="Inbox Filters">
        {(["all", "unread", "high"] as InboxFilter[]).map((filter) => {
          const isActive = activeFilter === filter;
          const labels: Record<InboxFilter, string> = {
            all: "All",
            unread: "Unread",
            high: "High Priority",
          };
          return (
            <button
              key={filter}
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(filter)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? "var(--primary)" : "var(--bg-subtle)",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                transition: "background 0.15s ease",
              }}
            >
              {labels[filter]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
