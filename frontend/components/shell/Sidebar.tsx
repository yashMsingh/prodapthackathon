'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import styles from './Sidebar.module.css';
import WeatherCard from './WeatherCard';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const InboxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const TasksIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SignOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0)', transition: '200ms ease' }}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const navItems: NavItem[] = [
  { href: '/inbox', label: 'Inbox', icon: <InboxIcon />, badge: 4 },
  { href: '/tasks', label: 'Tasks', icon: <TasksIcon />, badge: 3 },
  { href: '/search', label: 'Search', icon: <SearchIcon /> },
];

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Don't render the sidebar on the login/auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/auth')) return null;

  const displayName = user?.name ?? 'Yash Singh';
  const displayEmail = user?.email ?? 'me@company.com';
  const initials = getInitials(displayName);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={styles.logoRow}>
        <div className={styles.logoMark}>
          <span className={styles.logoIcon}>✦</span>
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoName}>InboxAI</span>
            <span className={styles.logoBeta}>beta</span>
          </div>
        )}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className={styles.navBadge}>{item.badge}</span>
              ) : null}
              {collapsed && item.badge ? (
                <span className={styles.navBadgeDot} />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {!collapsed && <WeatherCard />}

        <div className={styles.userRow}>
          {/* Google profile picture or initials */}
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={displayName}
              width={32}
              height={32}
              className={styles.userAvatarImg}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.userAvatar}>{initials}</div>
          )}

          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userEmail}>{displayEmail}</span>
            </div>
          )}

          {!collapsed && (
            <button
              id="sign-out-btn"
              className={styles.signOutBtn}
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
            >
              <SignOutIcon />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
