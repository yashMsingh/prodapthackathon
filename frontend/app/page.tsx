import React from "react";
import Link from "next/link";
import WeatherWidget from "@/components/weather/WeatherWidget";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Hero Welcome Banner */}
      <section
        style={{
          padding: "2.5rem 2rem",
          backgroundColor: "#ffffff",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              padding: "0.2rem 0.65rem",
              backgroundColor: "var(--primary-subtle)",
              color: "var(--primary)",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            Frontend Foundation Active
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Next.js App Router • TypeScript
          </span>
        </div>

        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.025em" }}>
          InboxAI
        </h1>
        <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", fontWeight: 500, maxWidth: "600px" }}>
          Your Inbox. Smarter.
        </p>

        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/inbox"
            style={{
              padding: "0.7rem 1.4rem",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span>Open Smart Inbox</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/tasks"
            style={{
              padding: "0.7rem 1.4rem",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-primary)",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "1px solid var(--border-color)",
            }}
          >
            View Extracted Tasks
          </Link>
        </div>
      </section>

      {/* Core Philosophy: UNDERSTAND -> ORGANIZE -> TAKE ACTION */}
      <section aria-label="Core Philosophy">
        <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
          Product Architecture & Philosophy
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {/* Card 1: UNDERSTAND */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🧠</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
              Step 1
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: "0.25rem 0 0.5rem" }}>
              Understand
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Ingest incoming email threads, parse content semantics, and generate concise LLM executive summaries with reasoning.
            </p>
          </div>

          {/* Card 2: ORGANIZE */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚡</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>
              Step 2
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: "0.25rem 0 0.5rem" }}>
              Organize
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Score urgent priorities, extract structured action items and deadlines, and index messages into ChromaDB for semantic search.
            </p>
          </div>

          {/* Card 3: TAKE ACTION */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🚀</div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase" }}>
              Step 3
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: "0.25rem 0 0.5rem" }}>
              Take Action
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Generate context-aware reply drafts, inject environmental signals like weather, and complete tasks with single-click sign-offs.
            </p>
          </div>
        </div>
      </section>

      {/* Weather Context Widget */}
      <WeatherWidget />
    </div>
  );
}
