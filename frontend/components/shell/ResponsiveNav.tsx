"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ResponsiveNav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "56px",
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-color)",
        zIndex: 50,
        justifyContent: "space-around",
        alignItems: "center",
      }}
      className="mobile-nav-bar"
      aria-label="Mobile Navigation"
    >
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-nav-bar {
            display: flex !important;
          }
        }
      `}</style>
      <Link
        href="/inbox"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "0.75rem",
          color: pathname.startsWith("/inbox") ? "var(--primary)" : "var(--text-secondary)",
          fontWeight: pathname.startsWith("/inbox") ? 600 : 500,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>✉️</span>
        <span>Inbox</span>
      </Link>
      <Link
        href="/tasks"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "0.75rem",
          color: pathname.startsWith("/tasks") ? "var(--primary)" : "var(--text-secondary)",
          fontWeight: pathname.startsWith("/tasks") ? 600 : 500,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>✓</span>
        <span>Tasks</span>
      </Link>
      <Link
        href="/search"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "0.75rem",
          color: pathname.startsWith("/search") ? "var(--primary)" : "var(--text-secondary)",
          fontWeight: pathname.startsWith("/search") ? 600 : 500,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>🔍</span>
        <span>Search</span>
      </Link>
    </div>
  );
}
