"use client";

import { Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { vehicles } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaidRow {
  id: string;
  vehicleNo: string;
  flatNo: string;
  period: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: "Paid" | "Unpaid";
}

const rows: PaidRow[] = vehicles.slice(0, 15).map((v, i) => ({
  id: v.id,
  vehicleNo: v.vehicleNo,
  flatNo: v.flatNo,
  period: i % 2 === 0 ? "Monthly" : "Weekly",
  startDate: new Date(2026, 7, 1 + (i % 20)).toISOString(),
  endDate: new Date(2026, 8, 1 + (i % 20)).toISOString(),
  amount: i % 2 === 0 ? 500 : 150,
  status: i % 4 === 0 ? "Unpaid" : "Paid",
}));

export default function PaidParkingPage() {
  const columns: Column<PaidRow>[] = [
    { key: "vehicleNo", header: "Vehicle" },
    { key: "flatNo", header: "Flat" },
    { key: "period", header: "Period" },
    { key: "startDate", header: "Start", render: (r) => formatDate(r.startDate) },
    { key: "endDate", header: "End", render: (r) => formatDate(r.endDate) },
    { key: "amount", header: "Amount", render: (r) => formatCurrency(r.amount) },
    { key: "status", header: "Payment Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Paid Parking" description="Weekly / monthly paid parking subscriptions" actions={<Button><Plus className="h-4 w-4" /> New Subscription</Button>} />
      <Card>
        <DataTable columns={columns} data={rows} keyField="id" searchPlaceholder="Search paid parking..." filters={[{ key: "status", label: "Status", options: ["Paid", "Unpaid"] }]} rowActions={[{ label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} }]} />
      </Card>
    </div>
  );
}
