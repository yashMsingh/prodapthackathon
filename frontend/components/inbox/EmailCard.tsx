import React from "react";
import { Email } from "@/lib/types";
import PriorityBadge from "./PriorityBadge";

interface EmailCardProps {
  email: Email;
  isSelected: boolean;
  onSelect: (email: Email) => void;
}

export default function EmailCard({ email, isSelected, onSelect }: EmailCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`email-card ${isSelected ? "selected" : ""} ${email.unread ? "unread" : ""}`}
      onClick={() => onSelect(email)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(email);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Email from ${email.sender}: ${email.subject}. Priority ${email.priority}`}
    >
      <div className="email-card-header">
        <div className="email-sender">
          {email.unread && <span className="unread-dot" title="Unread email" aria-label="Unread" />}
          <span>{email.sender}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PriorityBadge priority={email.priority} />
          <span className="email-timestamp">{email.timestamp}</span>
        </div>
      </div>

      <div className="email-subject">{email.subject}</div>
      <div className="email-snippet">{email.preview}</div>

      {/* AI Quick Indicator Chip if Summary Exists */}
      {email.aiSummary && (
        <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.7rem", backgroundColor: "#eff6ff", color: "#2563eb", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: 600 }}>
            ✦ AI Analyzed
          </span>
          {email.deadline && (
            <span style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 500 }}>
              Due {email.deadline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
