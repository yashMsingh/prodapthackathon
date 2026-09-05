"use client";

import React, { useEffect, useState } from "react";
import { getBackendHealth } from "@/lib/api";

export default function Header() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    getBackendHealth()
      .then((res) => {
        if (isMounted) setBackendOnline(res.status === "ok");
      })
      .catch(() => {
        if (isMounted) setBackendOnline(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="app-header" aria-label="Application Header">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
          AI Workspace
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Backend Connectivity Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.75rem",
            padding: "0.3rem 0.65rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: backendOnline === true ? "var(--success-bg)" : "var(--bg-subtle)",
            color: backendOnline === true ? "var(--success-text)" : "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
          title={backendOnline === true ? "FastAPI backend reachable" : "Backend offline — using isolated mock adapter fallback"}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: backendOnline === true ? "#16a34a" : "#f59e0b",
              display: "inline-block",
            }}
          />
          <span>{backendOnline === true ? "API Connected" : "Mock Adapter Active"}</span>
        </div>

        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
          Hackathon Edition
        </div>
      </div>
    </header>
  );
}
