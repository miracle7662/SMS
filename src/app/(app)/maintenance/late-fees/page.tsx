"use client";

import { Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { maintenanceBills } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const overdue = maintenanceBills.filter((b) => b.status === "Overdue").map((b) => ({
  ...b,
  lateFee: Math.round(b.amount * 0.02),
}));

export default function LateFeesPage() {
  const columns = [
    { key: "billNo", header: "Bill No." },
    { key: "flatNo", header: "Flat" },
    { key: "ownerName", header: "Owner" },
    { key: "dueDate", header: "Due Date", render: (r: typeof overdue[0]) => formatDate(r.dueDate) },
    { key: "amount", header: "Bill Amount", render: (r: typeof overdue[0]) => formatCurrency(r.amount) },
    { key: "lateFee", header: "Late Fee (2%)", render: (r: typeof overdue[0]) => formatCurrency(r.lateFee) },
    { key: "status", header: "Status", render: (r: typeof overdue[0]) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Late Fees" description="Late fee applied on overdue maintenance bills" />
      <Card>
        <DataTable columns={columns} data={overdue} keyField="id" searchPlaceholder="Search..." rowActions={[{ label: "View Bill", icon: <Eye className="h-4 w-4" />, onClick: () => {} }]} />
      </Card>
    </div>
  );
}
