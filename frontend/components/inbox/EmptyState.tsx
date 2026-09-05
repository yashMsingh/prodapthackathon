import React from "react";

interface EmptyStateProps {
  message?: string;
  subtext?: string;
}

export default function EmptyState({
  message = "Your inbox is clear.",
  subtext = "All messages have been processed and prioritized by InboxAI.",
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: "3rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        flex: 1,
      }}
      role="status"
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#dcfce7",
          color: "#16a34a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          marginBottom: "1rem",
        }}
        aria-hidden="true"
      >
        ✓
      </div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
        {message}
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "280px" }}>
        {subtext}
      </p>
    </div>
  );
}
