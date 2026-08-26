import { ReportShell } from "@/components/modules/ReportShell";
import { Card, CardBody } from "@/components/ui/Card";
import { payments, expenses } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function IncomeExpenseReportPage() {
  const income = payments.reduce((s, p) => s + p.amount, 0);
  const expense = expenses.reduce((s, e) => s + e.amount, 0);
  const net = income - expense;

  return (
    <ReportShell title="Income & Expense Statement" description="Summary of income vs expenditure for the selected period">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardBody><p className="text-xs text-[var(--color-text-secondary)]">Total Income</p><p className="mt-1 text-xl font-semibold text-[var(--color-success)]">{formatCurrency(income)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs text-[var(--color-text-secondary)]">Total Expense</p><p className="mt-1 text-xl font-semibold text-[var(--color-danger)]">{formatCurrency(expense)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs text-[var(--color-text-secondary)]">Net Surplus / Deficit</p><p className={`mt-1 text-xl font-semibold ${net >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>{formatCurrency(net)}</p></CardBody></Card>
      </div>
    </ReportShell>
  );
}
