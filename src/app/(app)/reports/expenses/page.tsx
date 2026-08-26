"use client";

import { ReportShell } from "@/components/modules/ReportShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { expenses } from "@/lib/mock-data";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const columns: Column<Expense>[] = [
  { key: "category", header: "Category", render: (e) => <Badge>{e.category}</Badge> },
  { key: "vendor", header: "Vendor" },
  { key: "date", header: "Date", render: (e) => formatDate(e.date) },
  { key: "amount", header: "Amount", render: (e) => formatCurrency(e.amount) },
];

export default function ExpensesReportPage() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <ReportShell title="Expenses Report" description={`Total expenses this period: ${formatCurrency(total)}`}>
      <Card>
        <DataTable columns={columns} data={expenses} keyField="id" searchPlaceholder="Search expenses..." />
      </Card>
    </ReportShell>
  );
}
