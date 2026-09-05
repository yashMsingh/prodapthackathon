"use client";

import React, { useState } from "react";
import { Email } from "@/lib/types";
import { searchEmails } from "@/lib/api";
import { getMockSearchResult } from "@/lib/mockAdapter";
import EmailCard from "../inbox/EmailCard";
import EmailPreview from "../inbox/EmailPreview";

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await searchEmails(query);
      if (res.results && res.results.length > 0) {
        setResults(res.results);
        setSelectedEmail(res.results[0]);
      } else {
        const mock = await getMockSearchResult(query);
        setResults(mock.results);
        setSelectedEmail(mock.results[0] || null);
      }
    } catch {
      const mock = await getMockSearchResult(query);
      setResults(mock.results);
      setSelectedEmail(mock.results[0] || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emails semantically (e.g. 'compliance deadlines' or 'sprint retro')..."
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            fontSize: "0.95rem",
            backgroundColor: "#ffffff",
          }}
          aria-label="Semantic search query"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {searched && (
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Found {results.length} result(s) for &ldquo;{query}&rdquo;
        </div>
      )}


      {results.length > 0 ? (
        <div className="inbox-layout" style={{ height: "calc(100vh - 240px)" }}>
          <div className="email-list-panel">
            {results.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onSelect={(e) => setSelectedEmail(e)}
              />
            ))}
          </div>
          <div className="email-preview-panel">
            <EmailPreview email={selectedEmail} />
          </div>
        </div>
      ) : searched && !loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", backgroundColor: "#ffffff", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
          No emails matching your search query.
        </div>
      ) : null}
    </div>
  );
}
