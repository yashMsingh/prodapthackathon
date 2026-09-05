'use client';

import type { TaskItem, TaskStatus } from '@/lib/types';
import TaskCard from './TaskCard';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  tasks: TaskItem[];
}

const COLUMNS: { status: TaskStatus; label: string; icon: string }[] = [
  { status: 'todo', label: 'To Do', icon: '○' },
  { status: 'in_progress', label: 'In Progress', icon: '◑' },
  { status: 'done', label: 'Done', icon: '●' },
];

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div className={styles.board} aria-label="Task Kanban board">
      {COLUMNS.map((col) => {
        const colTasks = byStatus(col.status);
        return (
          <div key={col.status} className={`${styles.column} ${styles[col.status]}`}>
            <div className={styles.colHeader}>
              <div className={styles.colTitle}>
                <span className={styles.colIcon}>{col.icon}</span>
                <span>{col.label}</span>
              </div>
              <span className={styles.colCount}>{colTasks.length}</span>
            </div>
            <div className={styles.cards}>
              {colTasks.length === 0 ? (
                <div className={styles.emptyCol}>
                  <span>No tasks here</span>
                </div>
              ) : (
                colTasks.map((task, i) => (
                  <div key={task.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <TaskCard task={task} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
