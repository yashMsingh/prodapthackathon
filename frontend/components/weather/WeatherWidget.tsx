"use client";

import React, { useEffect, useState } from "react";
import { WeatherContext } from "@/lib/types";
import { getMockWeather } from "@/lib/mockAdapter";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherContext | null>(null);

  useEffect(() => {
    getMockWeather().then((res) => setWeather(res));
  }, []);

  if (!weather) return null;

  return (
    <div
      style={{
        padding: "0.85rem 1.15rem",
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem" }} aria-hidden="true">🌤️</span>
        <div>
          <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "#166534" }}>
            Weather Context: {weather.location} ({weather.temperature}°F, {weather.condition})
          </div>
          <div style={{ fontSize: "0.75rem", color: "#15803d" }}>
            {weather.summary}
          </div>
        </div>
      </div>

      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#166534", backgroundColor: "#dcfce7", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
        Drafter Inject Ready
      </div>
    </div>
  );
}
