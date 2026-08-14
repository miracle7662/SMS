"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  dashboardKPIs,
  bills,
  payments,
  complaints,
  notices,
  tenants,
  collectionChartData,
  currentSociety,
  buildings,
} from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChevronDown, Download, Filter } from "lucide-react";

export default function DashboardPage() {
  const pendingBills = bills.filter((b) => b.status === "Unpaid" || b.status === "Overdue" || b.status === "Partial");
  const defaulters = bills.filter((b) => b.status === "Overdue");
  const expiringTenants = tenants.filter((t) => t.agreementStatus === "Expiring Soon");

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`${currentSociety.name} · FY 2025-26`}
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}
        actions={
          <>
            <div className="flex items-center gap-2">
              <select className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--text)]">
                <option>{currentSociety.name}</option>
              </select>
              <select className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--text)]">
                <option>All Buildings</option>
                {buildings.map((b) => (
                  <option key={b.id}>{b.name}</option>
                ))}
              </select>
              <select className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--text)]">
                <option>FY 2025-26</option>
                <option>FY 2024-25</option>
              </select>
            </div>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardKPIs.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Charts + Pending */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Maintenance Collection</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="collected" name="Collected" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBills.slice(0, 5).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-light)] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{bill.flatNumber}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{bill.ownerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {formatCurrency(bill.amount - bill.paidAmount)}
                    </p>
                    <Badge status={bill.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Defaulters */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Defaulters</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent>
            {defaulters.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No defaulters this month.</p>
            ) : (
              <div className="space-y-3">
                {defaulters.map((b) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.flatNumber}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{b.ownerName}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--danger)]">
                      {formatCurrency(b.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complaints Summary */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Complaints Summary</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-2 gap-3">
              {[
                { label: "Open", count: complaints.filter((c) => c.status === "Open").length, color: "text-sky-600" },
                { label: "In Progress", count: complaints.filter((c) => c.status === "In Progress").length, color: "text-indigo-600" },
                { label: "Resolved", count: complaints.filter((c) => c.status === "Resolved").length, color: "text-emerald-600" },
                { label: "Total", count: complaints.length, color: "text-[var(--text)]" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-[var(--border-light)] p-3 text-center">
                  <p className={`text-xl font-semibold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {complaints.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-[var(--text)]">{c.complaintNo}</span>
                  <Badge status={c.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{p.memberName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {p.flatNumber} · {p.mode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(p.paidAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Notices</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text)]">{n.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDate(n.publishDate)}</p>
                  </div>
                  <Badge status={n.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tenant Agreements Expiring */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Agreements Expiring Soon</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent>
            {expiringTenants.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No agreements expiring soon.</p>
            ) : (
              <div className="space-y-3">
                {expiringTenants.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{t.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {t.flatNumber} · Ends {formatDate(t.rentEndDate)}
                      </p>
                    </div>
                    <Badge status={t.agreementStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Parking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Slots", value: 180 },
                { label: "Occupied", value: 142 },
                { label: "Available", value: 28 },
                { label: "Reserved", value: 10 },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-[var(--border-light)] p-3 text-center">
                  <p className="text-xl font-semibold text-[var(--text)]">{s.value}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
