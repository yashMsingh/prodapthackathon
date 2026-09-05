import React, { useState } from "react";
import Link from "next/link";
import { Email, getTaskDisplayText, getTaskDeadline } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";

interface EmailPreviewProps {
  email: Email | null;
  onBackToList?: () => void;
}

export default function EmailPreview({ email, onBackToList }: EmailPreviewProps) {
  const [copied, setCopied] = useState(false);

  if (!email) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-muted)",
          padding: "3rem 2rem",
          textAlign: "center",
          gap: "0.75rem",
        }}
        role="region"
        aria-label="Email details"
      >
        <div style={{ fontSize: "2rem", opacity: 0.5 }}>✉</div>
        <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-secondary)" }}>
          Select an email to view full content and InboxAI intelligence.
        </p>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          AI summaries, extracted tasks, and reply recommendations appear here.
        </span>
      </div>
    );
  }

  const hasAiIntelligence = Boolean(
    email.aiSummary ||
      email.importanceReason ||
      (email.extractedTasks && email.extractedTasks.length > 0) ||
      email.suggestedReply ||
      email.deadline
  );

  const handleCopyReply = async () => {
    if (!email.suggestedReply) return;
    try {
      await navigator.clipboard.writeText(email.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const threadUrl = `/thread/${encodeURIComponent(email.threadId || email.id)}`;

  return (
    <div
      style={{
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
      }}
      role="region"
      aria-label={`Email details: ${email.subject}`}
    >
      {/* Mobile Back Button (only shown on mobile screens via CSS) */}
      {onBackToList && (
        <button
          onClick={onBackToList}
          className="mobile-back-btn"
          aria-label="Back to email list"
          style={{
            alignSelf: "flex-start",
            display: "none",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.85rem",
            color: "var(--primary)",
            fontWeight: 600,
            padding: "0.4rem 0",
          }}
        >
          &larr; Back to Email List
        </button>
      )}

      {/* ============================================================ */}
      {/* 1. EMAIL CONTENT SECTION                                      */}
      {/* ============================================================ */}
      <section aria-labelledby="email-header-subject" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <PriorityBadge priority={email.priority} />
            {email.threadId && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                Thread ID: {email.threadId}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{email.timestamp}</span>
            <Link
              href={threadUrl}
              style={{
                fontSize: "0.75rem",
                color: "var(--primary)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
              title="Open standalone thread view"
            >
              Full Thread ↗
            </Link>
          </div>
        </div>

        <h2
          id="email-header-subject"
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
            wordBreak: "break-word",
            lineHeight: 1.3,
          }}
        >
          {email.subject}
        </h2>

        {/* Sender & Recipient Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-subtle)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1rem",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {email.sender.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{email.sender}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>&lt;{email.senderEmail}&gt;</span>
            </div>
            {email.recipient && (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                To: {email.recipient}
              </div>
            )}
          </div>
        </div>

        {/* Original Message Body */}
        <div
          style={{
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            padding: "1.25rem",
            marginTop: "0.5rem",
          }}
        >
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            Original Email Body
          </div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.6,
              color: "var(--text-primary)",
              fontSize: "0.925rem",
            }}
          >
            {email.body}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. INBOXAI INTELLIGENCE SECTION                              */}
      {/* ============================================================ */}
      <section
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
        aria-label="InboxAI Intelligence Block"
      >
        {/* Header with AI badge and disclaimer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <span style={{ color: "var(--primary)", fontSize: "1rem" }} aria-hidden="true">✦</span>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--primary)" }}>
              InboxAI Intelligence
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              (AI-generated analysis)
            </span>
          </div>
          {email.deadline && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--priority-high-text)",
                backgroundColor: "var(--priority-high-bg)",
                border: "1px solid var(--priority-high-border)",
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
              }}
            >
              Action Deadline: {email.deadline}
            </span>
          )}
        </div>

        {hasAiIntelligence ? (
          <>
            {/* AI Summary */}
            {email.aiSummary && (
              <div>
                <h3
                  style={{
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                    marginBottom: "0.3rem",
                  }}
                >
                  Executive Summary
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                  {email.aiSummary}
                </p>
              </div>
            )}

            {/* Why This Matters / Importance Reason */}
            {email.importanceReason && (
              <div>
                <h3
                  style={{
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                    marginBottom: "0.3rem",
                  }}
                >
                  Why This Matters
                </h3>
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>
                  {email.importanceReason}
                </p>
              </div>
            )}

            {/* Extracted Action Items */}
            {email.extractedTasks && email.extractedTasks.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "0.725rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--text-secondary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Extracted Action Items ({email.extractedTasks.length})
                </h3>
                <ul
                  style={{
                    listStyleType: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {email.extractedTasks.map((taskItem, idx) => {
                    const taskText = getTaskDisplayText(taskItem);
                    const taskDeadline = getTaskDeadline(taskItem);
                    return (
                      <li
                        key={idx}
                        style={{
                          fontSize: "0.825rem",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          color: "var(--text-primary)",
                          backgroundColor: "#ffffff",
                          padding: "0.45rem 0.65rem",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <span style={{ color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span>{taskText}</span>
                          {taskDeadline && (
                            <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#dc2626", fontWeight: 500 }}>
                              (Due: {taskDeadline})
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Suggested Reply */}
            {email.suggestedReply && (
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <h3
                    style={{
                      fontSize: "0.725rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    Suggested Reply Draft
                  </h3>
                  <button
                    onClick={handleCopyReply}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: copied ? "var(--success-text)" : "var(--primary)",
                      backgroundColor: copied ? "var(--success-bg)" : "var(--primary-subtle)",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-sm)",
                      transition: "all 0.15s ease",
                    }}
                    aria-label="Copy suggested reply to clipboard"
                  >
                    {copied ? "✓ Copied!" : "Copy to Clipboard"}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "0.85rem",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "0.85rem",
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ margin: 0, fontStyle: "italic" }}>
                    &ldquo;{email.suggestedReply}&rdquo;
                  </p>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Drafted by InboxAI — review and edit before sending.
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", fontStyle: "italic", padding: "0.5rem 0" }}>
            AI analysis unavailable or routine message: no action items or reply required.
          </div>
        )}
      </section>
    </div>
  );
}
