import type { Metadata } from "next";
import Sidebar from "@/components/shell/Sidebar";
import Header from "@/components/shell/Header";
import ResponsiveNav from "@/components/shell/ResponsiveNav";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
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
        <div className="app-container relative overflow-hidden min-h-screen">
          <AnimatedGradientBackground
            Breathing={true}
            containerClassName="fixed inset-0 pointer-events-none -z-10 opacity-40"
          />
          <Sidebar />
          <div className="main-content-wrapper relative z-10">
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
