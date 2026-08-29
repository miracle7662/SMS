"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronsLeft, Building, Building2 } from "lucide-react";
import { NAV } from "@/lib/nav";
import { ICON_MAP } from "./icon-map";
import { cn } from "@/lib/utils";
import { society } from "@/lib/mock-data";
import { initials } from "@/lib/utils";

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const storages = [window.localStorage, window.sessionStorage];
    const hasSuperAdminRole = storages.some((storage) => {
      try {
        const roles = JSON.parse(storage.getItem("society_platform_roles") || "[]");
        return Array.isArray(roles) && roles.includes("SUPER_ADMIN");
      } catch {
        return false;
      }
    });
    setIsSuperAdmin(hasSuperAdminRole);
  }, []);

  useEffect(() => {
    // auto expand the group matching current path
    const match = NAV.find((n) => n.children?.some((c) => pathname.startsWith(c.href)));
    if (match) setOpenGroups((prev) => new Set(prev).add(match.label));
  }, [pathname]);

  const isActiveParent = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isActiveChild = (href: string) => pathname === href;

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] transition-all duration-200 lg:z-30",
          collapsed ? "lg:w-[var(--sidebar-width-collapsed)]" : "lg:w-[var(--sidebar-width)]",
          "w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-[var(--header-height)] items-center gap-2.5 border-b border-[var(--color-border)] px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white">
            <Building className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-text)]">SocietyOS</p>
              <p className="truncate text-[11px] text-[var(--color-text-secondary)]">{society.name}</p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className={cn(
              "ml-auto hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] lg:flex",
              collapsed && "rotate-180"
            )}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-none flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="flex flex-col gap-0.5">
            {isSuperAdmin && (
              <li className="group relative">
                <Link
                  href="/super-admin/societies"
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith("/super-admin/societies")
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
                    collapsed && "lg:justify-center"
                  )}
                >
                  <Building2 className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">Manage Societies</span>}
                </Link>
              </li>
            )}
            {NAV.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const active = isActiveParent(item.href);
              const isOpen = openGroups.has(item.label);

              if (!item.children) {
                return (
                  <li key={item.label} className="group relative">
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
                        collapsed && "lg:justify-center"
                      )}
                    >
                      {Icon && <Icon className="h-[18px] w-[18px] shrink-0" />}
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                    {collapsed && (
                      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hidden lg:block">
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.label} className="group relative">
                  <button
                    onClick={() => (collapsed ? undefined : toggleGroup(item.label))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
                      collapsed && "lg:justify-center"
                    )}
                  >
                    {Icon && <Icon className="h-[18px] w-[18px] shrink-0" />}
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isOpen && "rotate-180")} />
                      </>
                    )}
                  </button>

                  {/* Expanded submenu */}
                  {!collapsed && isOpen && (
                    <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-[var(--color-border)] pl-4 ml-3.5">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onCloseMobile}
                            className={cn(
                              "block rounded-[var(--radius-sm)] px-3 py-2 text-[13px] transition-colors",
                              isActiveChild(child.href)
                                ? "bg-[var(--color-primary)]/10 font-medium text-[var(--color-primary)]"
                                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Collapsed flyout */}
                  {collapsed && (
                    <div className="pointer-events-none absolute left-full top-0 z-50 ml-2 hidden min-w-[200px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] py-1.5 opacity-0 shadow-[var(--shadow-md)] transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 lg:block">
                      <p className="px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]">{item.label}</p>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3.5 py-2 text-sm transition-colors hover:bg-[var(--color-bg)]",
                            isActiveChild(child.href) ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile */}
        <div className={cn("border-t border-[var(--color-border)] p-3", collapsed && "flex justify-center")}>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-bg)]",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
              {initials("Anil Deshmukh")}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[var(--color-text)]">Anil Deshmukh</p>
                <p className="truncate text-[11px] text-[var(--color-text-secondary)]">Society Admin</p>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
