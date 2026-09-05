import React from "react";
import Link from "next/link";
import Navigation from "./Navigation";

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="sidebar-header">
        <Link href="/" className="sidebar-brand">
          <div className="brand-icon">AI</div>
          <div>
            <div style={{ lineHeight: 1.2 }}>InboxAI</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>
              Your Inbox. Smarter.
            </div>
          </div>
        </Link>
      </div>

      {/* Product Philosophy Mini Banner */}
      <div style={{ padding: "0.75rem 1rem", margin: "0.75rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
          Core Engine
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600 }}>
          <span>Understand</span>
          <span style={{ color: "var(--text-muted)" }}>&rarr;</span>
          <span>Organize</span>
          <span style={{ color: "var(--text-muted)" }}>&rarr;</span>
          <span>Act</span>
        </div>
      </div>

      <Navigation />

      {/* User / Workspace Footer */}
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#3730a3", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
          YS
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Yash M. Singh
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            Frontend Active
          </div>
        </div>
      </div>
    </aside>
  );
}
