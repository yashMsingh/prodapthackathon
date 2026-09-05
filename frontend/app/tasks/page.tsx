import React from "react";
import TasksView from "@/components/tasks/TasksView";

export default function TasksPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TasksView />
    </div>
  );
}
