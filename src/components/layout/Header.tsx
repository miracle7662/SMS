"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  UserCog,
  Settings as SettingsIcon,
  Check,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn, initials, formatDateTime } from "@/lib/utils";
import { clearActiveSociety, clearSocietySession, SocietySession } from "@/lib/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export function Header({
  onToggleSidebar,
  onOpenMobile,
  dark,
  onToggleDark,
  session,
}: {
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  dark: boolean;
  onToggleDark: () => void;
  session: SocietySession | null;
}) {
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<Array<{ id: number; title: string; message: string; status: string; created_at: string }>>([]);
  const unread = liveNotifications.filter((n) => n.status !== "READ").length;

  useEffect(() => {
    if (!session?.activeSociety || !session.accessToken) return;
    fetch(`${API_URL}/society/notifications`, { headers: { Authorization: `Bearer ${session.accessToken}` } })
      .then((response) => response.json())
      .then((result) => {
        if (!result.success) return;
        const rows = result.data.my_notifications ?? result.data.notifications ?? [];
        setLiveNotifications(rows.filter((row: { channel: string }) => row.channel === "IN_APP").slice(0, 8));
      })
      .catch(() => {});
  }, [session?.activeSociety, session?.accessToken]);

  async function markAllRead() {
    if (!session?.accessToken) return;
    await fetch(`${API_URL}/society/notifications/read-all`, { method: "PATCH", headers: { Authorization: `Bearer ${session.accessToken}` } });
    setLiveNotifications((rows) => rows.map((row) => ({ ...row, status: "READ" })));
  }

  async function handleLogout() {
    if (logoutLoading) return;

    setLogoutLoading(true);

    const refreshToken =
      localStorage.getItem("society_refresh_token") ||
      sessionStorage.getItem("society_refresh_token");

    const accessToken =
      localStorage.getItem("society_access_token") ||
      sessionStorage.getItem("society_access_token");

    try {
      if (accessToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      clearSocietySession();
      router.push("/login");
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-card)]/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onToggleSidebar}
        className="hidden rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] lg:flex"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global Search */}
      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />

        <input
          placeholder="Search flats, members, bills, complaints..."
          className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 text-sm placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {session?.activeSociety && (
          <button
            type="button"
            onClick={() => router.push("/select-society")}
            className="hidden items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] md:flex"
            title="Switch society"
          >
            <Building2 className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="max-w-44 truncate">{session.activeSociety.name ?? session.activeSociety.society_name ?? "Selected Society"}</span>
          </button>
        )}
        {/* Help */}
        <button
          className="hidden h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] sm:flex"
          title="Help"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        {/* Theme */}
        <button
          onClick={onToggleDark}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
          title="Toggle theme"
        >
          {dark ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
          >
            <Bell className="h-[18px] w-[18px]" />

            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-semibold text-white">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotifOpen(false)}
              />

              <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-md)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    Notifications
                  </p>

                  <button type="button" onClick={() => void markAllRead()} className="flex items-center gap-1 text-xs text-[var(--color-primary)]">
                    <Check className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {liveNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "flex gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-0",
                        n.status !== "READ" && "bg-[var(--color-primary)]/5"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          n.status === "READ"
                            ? "bg-transparent"
                            : "bg-[var(--color-primary)]"
                        )}
                      />

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)]">
                          {n.title}
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                          {n.message}
                        </p>

                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                          {formatDateTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/communication/history"
                  className="block px-4 py-2.5 text-center text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
                >
                  View all notifications
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mx-1 hidden h-6 w-px bg-[var(--color-border)] sm:block" />

        {/* User menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-[var(--color-bg)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
                {initials(session?.user?.name || "User")}
              </div>

              <span className="hidden text-sm font-medium text-[var(--color-text)] sm:block">
                {session?.user?.name || "User"}
              </span>

              <ChevronDown className="hidden h-3.5 w-3.5 text-[var(--color-text-muted)] sm:block" />
            </button>
          }
          items={[
            ...(session?.isSuperAdmin && session.activeSociety ? [{
              label: "Back to Super Admin",
              icon: <ArrowLeft className="h-4 w-4" />,
              onClick: () => {
                clearActiveSociety(session.storage);
                router.push("/super-admin/societies");
              },
            }] : []),
            ...(session?.activeSociety ? [{
              label: "Switch Society",
              icon: <Building2 className="h-4 w-4" />,
              onClick: () => router.push("/select-society"),
            }] : []),
            {
              label: "My Profile",
              icon: <UserCog className="h-4 w-4" />,
            },
            {
              label: "Settings",
              icon: <SettingsIcon className="h-4 w-4" />,
            },
            {
              divider: true,
              label: "",
            },
            {
              label: logoutLoading ? "Logging out..." : "Log Out",
              icon: <LogOut className="h-4 w-4" />,
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}
