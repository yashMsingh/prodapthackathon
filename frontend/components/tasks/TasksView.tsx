"use client";

import React, { useEffect, useState } from "react";
import { Task } from "@/lib/types";
import { getTasks } from "@/lib/api";
import { getMockTasks } from "@/lib/mockAdapter";
import PriorityBadge from "../inbox/PriorityBadge";

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks()
      .then((data) => {
        if (data && data.length > 0) {
          setTasks(data);
        } else {
          return getMockTasks();
        }
      })
      .then((fallback) => {
        if (fallback) setTasks(fallback);
      })
      .catch(async () => {
        const mock = await getMockTasks();
        setTasks(mock);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>Action Items & Deadlines</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Automatically extracted by InboxAI from incoming email threads
          </p>
        </div>
        <span style={{ fontSize: "0.8rem", backgroundColor: "var(--bg-subtle)", padding: "0.25rem 0.65rem", borderRadius: "9999px", fontWeight: 600 }}>
          {tasks.filter((t) => !t.completed).length} pending
        </span>
      </div>

      {loading ? (
        <div style={{ padding: "2rem", color: "var(--text-muted)", textAlign: "center" }}>
          Loading action items...
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          No action items found.
        </div>
      ) : (
        <div style={{ padding: "0.5rem" }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                borderBottom: "1px solid var(--border-color)",
                opacity: task.completed ? 0.6 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                style={{ marginTop: "0.25rem", width: "16px", height: "16px", cursor: "pointer" }}
                aria-label={`Mark task ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.925rem", textDecoration: task.completed ? "line-through" : "none", color: "var(--text-primary)" }}>
                  {task.title}
                </div>
                {task.description && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                    {task.description}
                  </div>
                )}
                {task.dueDate && (
                  <div style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.35rem", fontWeight: 500 }}>
                    Due: {task.dueDate}
                  </div>
                )}
              </div>
              <PriorityBadge priority={task.priority} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
