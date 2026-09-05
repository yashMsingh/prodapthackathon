"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  comingSoon?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { name: "Inbox", href: "/inbox", icon: "✉️", badge: "4" },
  { name: "Tasks", href: "/tasks", icon: "✓", badge: "3" },
  { name: "Search", href: "/search", icon: "🔍" },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { name: "Weather Context", href: "#", icon: "🌤️", comingSoon: true },
  { name: "Draft Assistant", href: "#", icon: "⚡", comingSoon: true },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav" aria-label="Main Navigation">
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 0.5rem 0.5rem" }}>
        Workspace
      </div>
      {PRIMARY_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`nav-link ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span style={{ fontSize: "1.1rem" }} aria-hidden="true">{item.icon}</span>
            <span>{item.name}</span>
            {item.badge && (
              <span className={`nav-badge ${isActive ? "active-badge" : ""}`}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}

      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "1.5rem 0.5rem 0.5rem" }}>
        Intelligence (Phase 3)
      </div>
      {SECONDARY_NAV_ITEMS.map((item) => (
        <div
          key={item.name}
          className="nav-link"
          style={{ opacity: 0.6, cursor: "not-allowed" }}
          title="Scheduled for next development phase"
        >
          <span style={{ fontSize: "1.1rem" }} aria-hidden="true">{item.icon}</span>
          <span>{item.name}</span>
          <span style={{ marginLeft: "auto", fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#64748b" }}>
            Soon
          </span>
        </div>
      ))}
    </nav>
  );
}
