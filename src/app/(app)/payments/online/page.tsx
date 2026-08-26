"use client";

import { Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { payments } from "@/lib/mock-data";
import { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OnlinePaymentsPage() {
  const data = payments.filter((p) => p.mode === "UPI" || p.mode === "Online");
  const columns: Column<Payment>[] = [
    { key: "receiptNo", header: "Receipt No." },
    { key: "flatNo", header: "Flat" },
    { key: "payerName", header: "Payer" },
    { key: "mode", header: "Gateway" },
    { key: "date", header: "Date", render: (p) => formatDate(p.date) },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount) },
    { key: "status", header: "Status", render: () => <StatusBadge status="Paid" /> },
  ];

  return (
    <div>
      <PageHeader title="Online Payments" description="Payments collected via UPI and online payment gateway" />
      <Card>
        <DataTable columns={columns} data={data} keyField="id" searchPlaceholder="Search online payments..." rowActions={[{ label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} }]} onExport={() => {}} />
      </Card>
    </div>
  );
}
