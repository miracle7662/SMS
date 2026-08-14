"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  MessageSquareWarning,
  Bell,
  Car,
  UserPlus,
  Waves,
  Truck,
  Receipt,
  FileText,
  BarChart3,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  Layers,
  DoorOpen,
  UserCheck,
  FileStack,
  Wallet,
  ClipboardList,
  AlertTriangle,
  Banknote,
  Megaphone,
  ParkingCircle,
  CalendarCheck,
  Package,
  FolderOpen,
  Shield,
  LogOut,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentSociety } from "@/data/mock";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Society Setup",
    icon: Building2,
    children: [
      { label: "Society Profile", href: "/society/profile" },
      { label: "Buildings / Wings", href: "/society/buildings" },
      { label: "Floors", href: "/society/floors" },
      { label: "Flats", href: "/society/flats" },
      { label: "Society Settings", href: "/settings" },
    ],
  },
  {
    label: "Members",
    icon: Users,
    children: [
      { label: "All Members", href: "/members" },
      { label: "Owners", href: "/members/owners" },
      { label: "Co-Owners", href: "/members/owners" },
      { label: "Tenants", href: "/members/tenants" },
      { label: "Family Members", href: "/members/family-members" },
      { label: "Member Documents", href: "/members/documents" },
    ],
  },
  {
    label: "Maintenance",
    icon: CreditCard,
    children: [
      { label: "Charge Types", href: "/maintenance/charges" },
      { label: "Generate Bills", href: "/maintenance/bills" },
      { label: "All Bills", href: "/maintenance/bills" },
      { label: "Pending Bills", href: "/maintenance/bills" },
      { label: "Defaulters", href: "/maintenance/defaulters" },
    ],
  },
  {
    label: "Payments",
    icon: Banknote,
    children: [
      { label: "Collection", href: "/payments" },
      { label: "Payment Transactions", href: "/payments" },
      { label: "Receipts", href: "/payments" },
    ],
  },
  {
    label: "Complaints",
    icon: MessageSquareWarning,
    children: [
      { label: "All Complaints", href: "/complaints" },
      { label: "Open", href: "/complaints" },
      { label: "In Progress", href: "/complaints" },
      { label: "Resolved", href: "/complaints" },
    ],
  },
  {
    label: "Communication",
    icon: Megaphone,
    children: [
      { label: "Notices", href: "/notices" },
      { label: "Announcements", href: "/notices" },
    ],
  },
  {
    label: "Parking",
    icon: ParkingCircle,
    children: [
      { label: "Parking Slots", href: "/parking" },
      { label: "Vehicles", href: "/parking" },
      { label: "Paid Parking", href: "/parking" },
    ],
  },
  {
    label: "Visitor Management",
    icon: UserPlus,
    children: [
      { label: "Today's Visitors", href: "/visitors" },
      { label: "Visitor History", href: "/visitors" },
    ],
  },
  {
    label: "Amenities",
    icon: Waves,
    children: [
      { label: "Amenity Master", href: "/amenities" },
      { label: "Bookings", href: "/amenities" },
    ],
  },
  {
    label: "Vendors",
    icon: Truck,
    children: [{ label: "Vendor Master", href: "/vendors" }],
  },
  {
    label: "Expenses",
    icon: Receipt,
    children: [
      { label: "Expense Categories", href: "/expenses" },
      { label: "Expenses", href: "/expenses" },
    ],
  },
  {
    label: "Documents",
    icon: FolderOpen,
    children: [
      { label: "Society Rules", href: "/documents" },
      { label: "Bye-Laws", href: "/documents" },
      { label: "AGM Documents", href: "/documents" },
      { label: "Financial Documents", href: "/documents" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Maintenance Collection", href: "/reports" },
      { label: "Defaulters", href: "/reports" },
      { label: "Income & Expense", href: "/reports" },
    ],
  },
  {
    label: "Users & Roles",
    icon: UserCog,
    children: [
      { label: "Users", href: "/users" },
      { label: "Roles", href: "/users" },
      { label: "Permissions", href: "/users" },
    ],
  },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(["Society Setup", "Members", "Maintenance"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    return item.children?.some((c) => isActive(c.href)) ?? false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] transition-all duration-300",
          collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[var(--sidebar-border)] px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <Building className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text)]">Society ERP</p>
              <p className="truncate text-xs text-[var(--text-secondary)]">{currentSociety.name.split(" ").slice(0, 2).join(" ")}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const parentActive = isParentActive(item);
              const isOpen = openMenus.includes(item.label);

              if (!item.children) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href!}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-[var(--primary)] text-white"
                          : "text-[var(--text-secondary)] hover:bg-[var(--border-light)] hover:text-[var(--text)]"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium transition-colors",
                      parentActive
                        ? "bg-[var(--border-light)] text-[var(--primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--border-light)] hover:text-[var(--text)]"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {!collapsed && isOpen && (
                    <ul className="mt-1 space-y-0.5 border-l border-[var(--border)] ml-5 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href + child.label}>
                          <Link
                            href={child.href}
                            onClick={onMobileClose}
                            className={cn(
                              "block rounded-[var(--radius)] px-3 py-2 text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-[var(--primary)]/10 font-medium text-[var(--primary)]"
                                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        {!collapsed && (
          <div className="border-t border-[var(--sidebar-border)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-semibold text-[var(--primary)]">
                RS
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text)]">Ravi Sharma</p>
                <p className="truncate text-xs text-[var(--text-secondary)]">Society Admin</p>
              </div>
              <button className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text)]">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
