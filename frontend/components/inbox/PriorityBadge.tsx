import React from "react";
import { PriorityLevel, normalizePriority } from "@/lib/types";

interface PriorityBadgeProps {
  priority?: PriorityLevel | string | null;
  showIcon?: boolean;
}

export default function PriorityBadge({
  priority,
  showIcon = true,
}: PriorityBadgeProps) {
  const normalized = normalizePriority(priority);

  const configs: Record<
    PriorityLevel,
    { label: string; text: string; icon: string; className: string }
  > = {
    high: {
      label: "High Priority",
      text: "High",
      icon: "▲",
      className: "badge-high",
    },
    medium: {
      label: "Medium Priority",
      text: "Medium",
      icon: "■",
      className: "badge-medium",
    },
    low: {
      label: "Low Priority",
      text: "Low",
      icon: "▼",
      className: "badge-low",
    },
  };

  const config = configs[normalized];

  return (
    <span
      className={`badge ${config.className}`}
      aria-label={config.label}
      title={config.label}
    >
      {showIcon && (
        <span aria-hidden="true" style={{ fontSize: "0.65rem", lineHeight: 1 }}>
          {config.icon}
        </span>
      )}
      <span>{config.text}</span>
    </span>
  );
}
