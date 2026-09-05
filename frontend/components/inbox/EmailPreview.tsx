import React from "react";
import { Email } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";

interface EmailPreviewProps {
  email: Email | null;
}

export default function EmailPreview({ email }: EmailPreviewProps) {
  if (!email) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-muted)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        Select an email from the list to preview message and AI insights.
      </div>
    );
  }

  return (
    <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Area */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <PriorityBadge priority={email.priority} />
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{email.timestamp}</span>
        </div>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem", wordBreak: "break-word" }}>
          {email.subject}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {email.sender.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{email.sender}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{email.senderEmail}</div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Architecture Block */}
      <section
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
        aria-label="AI Intelligence Overview"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)" }}>
            <span>✦</span>
            <span>InboxAI Intelligence</span>
          </div>
          {email.deadline && (
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b91c1c", backgroundColor: "#fee2e2", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
              Action Due: {email.deadline}
            </span>
          )}
        </div>

        {/* AI Summary */}
        {email.aiSummary && (
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
              Summary
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: 1.45 }}>
              {email.aiSummary}
            </p>
          </div>
        )}

        {/* Importance Reason */}
        {email.importanceReason && (
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
              Why This Matters
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {email.importanceReason}
            </p>
          </div>
        )}

        {/* Action Items / Extracted Tasks */}
        {email.extractedTasks && email.extractedTasks.length > 0 && (
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
              Extracted Action Items ({email.extractedTasks.length})
            </div>
            <ul style={{ listStyleType: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {email.extractedTasks.map((task, idx) => (
                <li key={idx} style={{ fontSize: "0.8rem", display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-primary)" }}>
                  <span style={{ color: "var(--primary)", fontWeight: 700 }}>✓</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Quick Reply Slot */}
        {email.suggestedReply && (
          <div style={{ marginTop: "0.25rem", borderTop: "1px dashed #cbd5e1", paddingTop: "0.75rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
              Suggested AI Reply
            </div>
            <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
              "{email.suggestedReply}"
            </div>
          </div>
        )}
      </section>

      {/* Full Email Body */}
      <section style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          Original Message
        </div>
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6, color: "var(--text-primary)", fontSize: "0.925rem" }}>
          {email.body}
        </div>
      </section>
    </div>
  );
}
