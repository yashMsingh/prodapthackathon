import React from "react";
import { Email, normalizePriority } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";

interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onSelect: (email: Email) => void;
}

export default function EmailCard({
  email,
  isSelected,
  onSelect,
}: EmailCardProps) {
  const normalizedPriority = normalizePriority(email.priority);
  const taskCount = email.extractedTasks?.length || 0;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`email-card ${isSelected ? "selected" : ""} ${
        email.unread ? "unread" : ""
      }`}
      onClick={() => onSelect(email)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(email);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Email from ${email.sender}: ${email.subject}. Priority ${normalizedPriority}.${
        email.unread ? " Unread." : ""
      }`}
    >
      <div className="email-card-header">
        <div className="email-sender">
          {email.unread && (
            <span
              className="unread-dot"
              title="Unread email"
              aria-label="Unread message"
            />
          )}
          <span style={{ fontWeight: email.unread ? 700 : 600 }}>
            {email.sender}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PriorityBadge priority={normalizedPriority} />
          <span className="email-timestamp">{email.timestamp}</span>
        </div>
      </div>

      <div className="email-subject">{email.subject}</div>
      <div className="email-snippet">{email.preview}</div>

      {/* AI Quick Indicator Chip if Summary/Tasks Exist */}
      {(email.aiSummary || taskCount > 0) && (
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {email.aiSummary && (
            <span
              style={{
                fontSize: "0.7rem",
                backgroundColor: "var(--primary-subtle)",
                color: "var(--primary)",
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              ✦ AI Analyzed
            </span>
          )}

          {taskCount > 0 && (
            <span
              style={{
                fontSize: "0.7rem",
                backgroundColor: "#f1f5f9",
                color: "var(--text-secondary)",
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                fontWeight: 500,
              }}
            >
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </span>
          )}

          {email.deadline && (
            <span
              style={{
                fontSize: "0.7rem",
                color: "#dc2626",
                fontWeight: 500,
              }}
            >
              Due {email.deadline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
