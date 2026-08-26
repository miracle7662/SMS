import { IndianRupee, CreditCard, FileCheck2, Wifi, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { payments } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PaymentsDashboardPage() {
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const modes = ["UPI", "NEFT", "Cash", "Cheque", "Online"] as const;

  return (
    <div>
      <PageHeader title="Payments" description="Collection and transaction overview" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={IndianRupee} title="Total Collected (Aug)" value={formatCurrency(total)} tone="success" />
        <StatCard icon={CreditCard} title="Transactions" value={String(payments.length)} tone="primary" />
        <StatCard icon={FileCheck2} title="Receipts Issued" value={String(payments.length)} tone="info" />
        <StatCard icon={Wifi} title="Online Payments" value={String(payments.filter((p) => p.mode === "Online" || p.mode === "UPI").length)} tone="warning" />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent Transactions</h3>
        </div>
        <div className="table-scroll">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                <th className="px-5 py-3">Receipt No.</th>
                <th className="px-5 py-3">Payer</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 text-[var(--color-text)]">{p.receiptNo}</td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">{p.payerName}</td>
                  <td className="px-5 py-3"><Badge>{p.mode}</Badge></td>
                  <td className="px-5 py-3 text-[var(--color-text-secondary)]">{formatDate(p.date)}</td>
                  <td className="px-5 py-3 text-right font-medium text-[var(--color-success)]">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
