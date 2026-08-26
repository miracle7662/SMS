"use client";

import { Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { vendors, expenses } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ServiceRow {
  id: string;
  vendor: string;
  service: string;
  lastServiceDate: string;
  amount: number;
  status: string;
}

const rows: ServiceRow[] = vendors.map((v, i) => ({
  id: v.id,
  vendor: v.name,
  service: v.service,
  lastServiceDate: expenses.find((e) => e.vendor === v.name)?.date ?? new Date(2026, 6, 1 + i).toISOString(),
  amount: expenses.find((e) => e.vendor === v.name)?.amount ?? 5000,
  status: v.status,
}));

export default function VendorServicesPage() {
  const columns: Column<ServiceRow>[] = [
    { key: "vendor", header: "Vendor" },
    { key: "service", header: "Service" },
    { key: "lastServiceDate", header: "Last Service Date", render: (r) => formatDate(r.lastServiceDate) },
    { key: "amount", header: "Last Billed Amount", render: (r) => formatCurrency(r.amount) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Vendor Services" description="Service history for each vendor" />
      <Card>
        <DataTable columns={columns} data={rows} keyField="id" searchPlaceholder="Search services..." rowActions={[{ label: "View History", icon: <Eye className="h-4 w-4" />, onClick: () => {} }]} />
      </Card>
    </div>
  );
}
