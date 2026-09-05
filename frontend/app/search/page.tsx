import React from "react";
import SearchView from "@/components/search/SearchView";

export default function SearchPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ padding: "0.5rem 0" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Semantic & Vector Email Search
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Query emails using natural language semantics or traditional keywords.
        </p>
      </div>
      <SearchView />
    </div>
  );
}
