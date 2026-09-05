import React from "react";
import { Email } from "@/lib/types";
import EmailCard from "./EmailCard";

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
}

export default function EmailList({ emails, selectedEmailId, onSelectEmail }: EmailListProps) {
  return (
    <div
      className="email-list-container"
      style={{ overflowY: "auto", flex: 1 }}
      role="feed"
      aria-label="Email Messages"
    >
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          isSelected={email.id === selectedEmailId}
          onSelect={onSelectEmail}
        />
      ))}
    </div>
  );
}
