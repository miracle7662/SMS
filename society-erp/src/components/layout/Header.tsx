"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
}

export function Header({ onMenuClick, collapsed }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--card)] px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--border-light)] hover:text-[var(--text)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onMenuClick}
        className="hidden rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--border-light)] hover:text-[var(--text)] lg:flex"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="search"
          placeholder="Search flats, members, bills..."
          className="h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" title="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
          </Button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-lg">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <h4 className="text-sm font-semibold">Notifications</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[
                    { title: "New maintenance bill generated", time: "2 min ago", type: "bill" },
                    { title: "Complaint CMP-2025-0142 assigned", time: "1 hour ago", type: "complaint" },
                    { title: "Tenant agreement expiring soon - A-101", time: "3 hours ago", type: "tenant" },
                    { title: "Payment received - ₹4,850", time: "Yesterday", type: "payment" },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="flex gap-3 border-b border-[var(--border-light)] px-4 py-3 hover:bg-[var(--border-light)] cursor-pointer"
                    >
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                      <div>
                        <p className="text-sm text-[var(--text)]">{n.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] p-2 text-center">
                  <button className="text-sm font-medium text-[var(--primary)] hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--border-light)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)]">
              RS
            </div>
            <span className="hidden text-sm font-medium text-[var(--text)] sm:block">Ravi Sharma</span>
            <ChevronDown className="hidden h-4 w-4 text-[var(--text-muted)] sm:block" />
          </button>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--border-light)]">
                  <User className="h-4 w-4" /> Profile
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--border-light)]">
                  <Settings className="h-4 w-4" /> Settings
                </button>
                <div className="my-1 border-t border-[var(--border)]" />
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--border-light)]">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
