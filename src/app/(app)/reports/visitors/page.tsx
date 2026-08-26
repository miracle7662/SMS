"use client";

import { ReportShell } from "@/components/modules/ReportShell";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { visitors } from "@/lib/mock-data";
import { Visitor } from "@/types";
import { formatDate } from "@/lib/utils";

const columns: Column<Visitor>[] = [
  { key: "name", header: "Visitor" },
  { key: "purpose", header: "Purpose" },
  { key: "flatNo", header: "Flat" },
  { key: "checkIn", header: "Check-In", render: (v) => formatDate(v.checkIn) },
  { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status === "In" ? "Active" : "Closed"} /> },
];

export default function VisitorsReportPage() {
  return (
    <ReportShell title="Visitors Report" description={`${visitors.length} visitor entries in selected period`}>
      <Card>
        <DataTable columns={columns} data={visitors} keyField="id" searchPlaceholder="Search visitors..." />
      </Card>
    </ReportShell>
  );
}
