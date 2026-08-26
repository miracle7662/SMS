import {
  Building2,
  Home,
  DoorOpen,
  Users,
  UserCheck2,
  IndianRupee,
  AlertCircle,
  Wallet,
  ArrowRight,
  MessageSquareWarning,
  Bell,
  Car,
  ScanEye,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { CollectionChart } from "@/components/dashboard/CollectionChart";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import {
  kpis,
  maintenanceBills,
  complaints,
  payments,
  notices,
  tenants,
  parkingSlots,
  visitors,
} from "@/lib/mock-data";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";

export default function DashboardPage() {
  const defaulters = maintenanceBills.filter((b) => b.status === "Overdue").slice(0, 5);
  const pending = maintenanceBills.filter((b) => b.status !== "Paid").slice(0, 5);
  const recentPayments = payments.slice(0, 5);
  const recentNotices = notices.filter((n) => n.status === "Published").slice(0, 4);
  const expiringSoon = tenants
    .filter((t) => daysUntil(t.rentEnd) > 0 && daysUntil(t.rentEnd) < 60)
    .sort((a, b) => daysUntil(a.rentEnd) - daysUntil(b.rentEnd))
    .slice(0, 5);
  const complaintCounts = {
    Open: complaints.filter((c) => c.status === "Open").length,
    "In Progress": complaints.filter((c) => c.status === "In Progress").length,
    Resolved: complaints.filter((c) => c.status === "Resolved").length,
    Closed: complaints.filter((c) => c.status === "Closed").length,
  };
  const parkingCounts = {
    total: parkingSlots.length,
    available: parkingSlots.filter((p) => p.status === "Available").length,
    occupied: parkingSlots.filter((p) => p.status === "Occupied").length,
    reserved: parkingSlots.filter((p) => p.status === "Reserved").length,
  };
  const visitorsIn = visitors.filter((v) => v.status === "In").length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of Green Valley Co-operative Housing Society"
      />

      {/* Selectors */}
      <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:flex-row sm:items-end">
        <Select
          label="Society"
          wrapperClassName="sm:max-w-[240px]"
          options={[{ label: "Green Valley Co-operative Housing Society", value: "SOC001" }, { label: "Riverside Residency Society", value: "SOC002" }, { label: "Emerald Heights CHS", value: "SOC003" }]}
          defaultValue="SOC001"
        />
        <Select
          label="Building / Wing"
          wrapperClassName="sm:max-w-[200px]"
          options={[
            { label: "All Buildings", value: "all" },
            { label: "Sunrise Tower A", value: "a" },
            { label: "Sunrise Tower B", value: "b" },
            { label: "Palm Residency", value: "c" },
          ]}
          defaultValue="all"
        />
        <Select
          label="Financial Year"
          wrapperClassName="sm:max-w-[180px]"
          options={[
            { label: "FY 2026-27", value: "2026-27" },
            { label: "FY 2025-26", value: "2025-26" },
          ]}
          defaultValue="2026-27"
        />
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Home} title="Total Flats" value={String(kpis.totalFlats)} change="+2 this month" trend="up" tone="primary" />
        <StatCard icon={DoorOpen} title="Occupied Flats" value={String(kpis.occupiedFlats)} change="89.2%" trend="up" tone="success" />
        <StatCard icon={Building2} title="Vacant Flats" value={String(kpis.vacantFlats)} change="10.8%" trend="down" tone="warning" />
        <StatCard icon={Users} title="Total Members" value={String(kpis.totalMembers)} change="+8 this month" trend="up" tone="info" />
        <StatCard icon={UserCheck2} title="Total Tenants" value={String(kpis.totalTenants)} change="+3 this month" trend="up" tone="primary" />
        <StatCard
          icon={IndianRupee}
          title="Current Month Collection"
          value={formatCurrency(kpis.currentMonthCollection)}
          change="85.0% of target"
          trend="up"
          tone="success"
        />
        <StatCard icon={Wallet} title="Pending Maintenance" value={formatCurrency(kpis.pendingMaintenance)} change="18 flats" trend="down" tone="warning" />
        <StatCard icon={AlertCircle} title="Total Outstanding" value={formatCurrency(kpis.totalOutstanding)} change="32 flats" trend="down" tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Collection chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Maintenance Collection" description="Monthly collected amount vs target" />
          <CardBody>
            <CollectionChart />
          </CardBody>
        </Card>

        {/* Complaints summary */}
        <Card>
          <CardHeader
            title="Complaints Summary"
            action={
              <Link href="/complaints" className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="flex flex-col gap-3">
            {Object.entries(complaintCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="h-4 w-4 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{status}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--color-text)]">{count}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Pending Maintenance */}
        <Card>
          <CardHeader
            title="Pending Bills"
            action={
              <Link href="/maintenance/pending-bills" className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--color-border)]">
            {pending.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{b.flatNo} — {b.ownerName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Due {formatDate(b.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(b.amount)}</p>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Defaulters */}
        <Card>
          <CardHeader
            title="Defaulters"
            action={
              <Link href="/maintenance/defaulters" className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--color-border)]">
            {defaulters.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{b.flatNo} — {b.ownerName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{b.building}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-danger)]">{formatCurrency(b.amount)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent payments */}
        <Card>
          <CardHeader
            title="Recent Payments"
            action={
              <Link href="/payments/transactions" className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--color-border)]">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{p.payerName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{p.flatNo} · {p.mode} · {formatDate(p.date)}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-success)]">+{formatCurrency(p.amount)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader
            title="Recent Notices"
            action={
              <Link href="/communication/notices" className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--color-border)]">
            {recentNotices.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-5 py-3">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">{n.title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Published {formatDate(n.publishDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tenant Agreements Expiring */}
        <Card>
          <CardHeader
            title="Tenant Agreements Expiring Soon"
            action={
              <Link href="/members/tenants" className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--color-border)]">
            {expiringSoon.length === 0 && (
              <p className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">No agreements expiring soon.</p>
            )}
            {expiringSoon.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{t.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t.flatNo}, {t.building}</p>
                </div>
                <PriorityBadge priority={daysUntil(t.rentEnd) < 15 ? "Urgent" : "Medium"} />
              </div>
            ))}
          </div>
        </Card>

        {/* Parking + Visitor Summary */}
        <Card>
          <CardHeader title="Parking Summary" />
          <CardBody className="grid grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3 text-center">
              <Car className="mx-auto mb-1.5 h-4 w-4 text-[var(--color-text-muted)]" />
              <p className="text-lg font-semibold text-[var(--color-text)]">{parkingCounts.total}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Total Slots</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-success-bg)] p-3 text-center">
              <p className="text-lg font-semibold text-[var(--color-success)]">{parkingCounts.available}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Available</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-info-bg)] p-3 text-center">
              <p className="text-lg font-semibold text-[var(--color-info)]">{parkingCounts.occupied}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Occupied</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-warning-bg)] p-3 text-center">
              <p className="text-lg font-semibold text-[var(--color-warning)]">{parkingCounts.reserved}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Reserved</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Visitor Summary" description={`${visitorsIn} visitors currently inside the premises`} />
        <div className="table-scroll">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                <th className="px-5 py-3">Visitor</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Flat</th>
                <th className="px-5 py-3">Check-In</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice(0, 6).map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="flex items-center gap-2 px-5 py-3 text-[var(--color-text)]">
                    <ScanEye className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /> {v.name}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">{v.purpose}</td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">{v.flatNo}</td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">{formatDate(v.checkIn)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={v.status === "In" ? "Active" : "Closed"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
