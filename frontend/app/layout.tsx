import type { Metadata } from "next";
import Sidebar from "@/components/shell/Sidebar";
import Header from "@/components/shell/Header";
import ResponsiveNav from "@/components/shell/ResponsiveNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "InboxAI — Your Inbox. Smarter.",
  description: "AI-powered email assistant built for speed, organization, and action.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Sidebar />
          <div className="main-content-wrapper">
            <Header />
            <main className="page-container" id="main-content">
              {children}
            </main>
          </div>
          <ResponsiveNav />
        </div>
      </body>
    </html>
  );
}
