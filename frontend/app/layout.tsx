import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import Sidebar from '@/components/shell/Sidebar';

export const metadata: Metadata = {
  title: 'InboxAI — AI-Powered Email Assistant',
  description:
    'Summarize email conversations, identify important messages, extract tasks and deadlines, and draft smart replies with AI.',
  keywords: ['email', 'ai', 'inbox', 'productivity', 'assistant'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-shell">
            <Sidebar />
            <div className="main-content">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
