import { Wallet, CheckCircle2, Clock, AlertTriangle, Home, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { maintenanceBills } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MaintenanceDashboardPage() {
  const total = maintenanceBills.reduce((s, b) => s + b.amount, 0);
  const collected = maintenanceBills.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const pending = maintenanceBills.filter((b) => b.status === "Unpaid").reduce((s, b) => s + b.amount, 0);
  const overdue = maintenanceBills.filter((b) => b.status === "Overdue").reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <PageHeader title="Maintenance" description="Billing overview for the current financial year" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Wallet} title="Current Month Billing" value={formatCurrency(total)} tone="primary" />
        <StatCard icon={CheckCircle2} title="Collected" value={formatCurrency(collected)} tone="success" />
        <StatCard icon={Clock} title="Pending" value={formatCurrency(pending)} tone="warning" />
        <StatCard icon={AlertTriangle} title="Overdue" value={formatCurrency(overdue)} tone="danger" />
        <StatCard icon={Home} title="Non-Occupancy Charges" value={formatCurrency(24500)} tone="info" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "Generate Bills", href: "/maintenance/generate-bills" },
          { label: "Charge Rules", href: "/maintenance/charge-rules" },
          { label: "Defaulters", href: "/maintenance/defaulters" },
          { label: "Late Fees", href: "/maintenance/late-fees" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5 text-sm font-medium text-[var(--color-text)] shadow-[var(--shadow-xs)] hover:border-[var(--color-primary)]/40"
          >
            {l.label} <LinkIcon className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader title="Recent Bills" description="Latest generated maintenance bills" />
        <div className="table-scroll">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                <th className="px-5 py-3">Bill No.</th>
                <th className="px-5 py-3">Flat</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceBills.slice(0, 8).map((b) => (
                <tr key={b.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 text-[var(--color-text)]">{b.billNo}</td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">{b.flatNo}</td>
                  <td className="px-5 py-3 font-medium text-[var(--color-text)]">{formatCurrency(b.amount)}</td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">{formatDate(b.dueDate)}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
