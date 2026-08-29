"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { getSocietySession, SocietySession } from "@/lib/session";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [session, setSession] = useState<SocietySession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const refreshSession = () => {
      setSession(getSocietySession());
      setSessionReady(true);
    };
    refreshSession();
    window.addEventListener("society-session-changed", refreshSession);
    window.addEventListener("storage", refreshSession);
    return () => {
      window.removeEventListener("society-session-changed", refreshSession);
      window.removeEventListener("storage", refreshSession);
    };
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    if (!session) {
      router.replace("/login");
      return;
    }

    const isPlatformPage = pathname.startsWith("/super-admin");
    const isSelectionPage = pathname === "/select-society";
    if (!session.activeSociety && !isPlatformPage && !isSelectionPage) {
      router.replace(session.isSuperAdmin ? "/super-admin/societies" : "/select-society");
    }
  }, [pathname, router, session, sessionReady]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        session={session}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-200",
          collapsed ? "lg:pl-[var(--sidebar-width-collapsed)]" : "lg:pl-[var(--sidebar-width)]"
        )}
      >
        <Header
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onOpenMobile={() => setMobileOpen(true)}
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
          session={session}
        />
        <main className="flex-1 p-4 sm:p-6">
          {sessionReady && session ? children : (
            <div className="py-16 text-center text-sm text-[var(--color-text-secondary)]">Loading your session...</div>
          )}
        </main>
      </div>
    </div>
  );
}
