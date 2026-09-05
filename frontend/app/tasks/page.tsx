import type { Metadata } from 'next';
import { getTasks } from '@/lib/api';
import TopBar from '@/components/shell/TopBar';
import KanbanBoard from '@/components/tasks/KanbanBoard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tasks — InboxAI',
  description: 'AI-extracted tasks and deadlines from your email conversations, organized on a Kanban board.',
};

export default async function TasksPage() {
  const { tasks } = await getTasks();
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <>
      <TopBar
        title="Tasks"
        subtitle={`${todoCount} to do · ${inProgressCount} in progress`}
      />
      <div className="page-body">
        <KanbanBoard tasks={tasks} />
      </div>
    </>
  );
}
