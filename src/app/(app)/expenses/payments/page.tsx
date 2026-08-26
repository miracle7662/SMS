"use client";

import { Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { expenses } from "@/lib/mock-data";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExpensePaymentsPage() {
  const paid = expenses.filter((e) => e.paymentStatus === "Paid");
  const columns: Column<Expense>[] = [
    { key: "vendor", header: "Paid To" },
    { key: "category", header: "Category" },
    { key: "date", header: "Payment Date", render: (e) => formatDate(e.date) },
    { key: "amount", header: "Amount", render: (e) => formatCurrency(e.amount) },
    { key: "paymentStatus", header: "Status", render: (e) => <StatusBadge status={e.paymentStatus} /> },
  ];

  return (
    <div>
      <PageHeader title="Expense Payments" description="Payments made against vendor expenses" />
      <Card>
        <DataTable columns={columns} data={paid} keyField="id" searchPlaceholder="Search payments..." rowActions={[{ label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} }]} onExport={() => {}} />
      </Card>
    </div>
  );
}
