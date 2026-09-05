import React from "react";

export default function LoadingState() {
  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }} role="status" aria-live="polite">
      <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500, marginBottom: "0.5rem" }}>
        Loading your inbox...
      </div>

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          style={{
            padding: "1.25rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="skeleton" style={{ width: "120px", height: "16px" }} />
            <div className="skeleton" style={{ width: "60px", height: "16px" }} />
          </div>
          <div className="skeleton" style={{ width: "80%", height: "18px" }} />
          <div className="skeleton" style={{ width: "95%", height: "14px" }} />
        </div>
      ))}
    </div>
  );
}
