import React from "react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Unable to load your inbox. Try again.",
  onRetry,
}: ErrorStateProps) {
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
      role="alert"
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#fee2e2",
          color: "#dc2626",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          marginBottom: "1rem",
        }}
        aria-hidden="true"
      >
        !
      </div>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
        {message}
      </h3>
      <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", maxWidth: "320px", marginBottom: "1.25rem" }}>
        Could not connect to the mail server. You can retry or switch to the isolated mock adapter.
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "0.5rem 1.25rem",
            backgroundColor: "var(--primary)",
            color: "#ffffff",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
