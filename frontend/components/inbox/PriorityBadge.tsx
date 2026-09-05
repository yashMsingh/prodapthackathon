import React from "react";
import { PriorityLevel } from "@/lib/types";

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const configs = {
    high: {
      label: "High Priority",
      icon: "▲",
      className: "badge-high",
    },
    medium: {
      label: "Medium",
      icon: "■",
      className: "badge-medium",
    },
    low: {
      label: "Low",
      icon: "▼",
      className: "badge-low",
    },
  };

  const config = configs[priority] || configs.low;

  return (
    <span className={`badge ${config.className}`} aria-label={config.label}>
      <span aria-hidden="true" style={{ fontSize: "0.65rem" }}>{config.icon}</span>
      <span>{priority}</span>
    </span>
  );
}
