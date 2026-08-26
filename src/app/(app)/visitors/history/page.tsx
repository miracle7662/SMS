"use client";

import { Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { visitors } from "@/lib/mock-data";
import { Visitor } from "@/types";
import { formatDate } from "@/lib/utils";

export default function VisitorHistoryPage() {
  const columns: Column<Visitor>[] = [
    { key: "name", header: "Visitor" },
    { key: "mobile", header: "Mobile" },
    { key: "purpose", header: "Purpose" },
    { key: "flatNo", header: "Flat" },
    { key: "checkIn", header: "Check-In", render: (v) => formatDate(v.checkIn) },
    { key: "checkOut", header: "Check-Out", render: (v) => (v.checkOut ? formatDate(v.checkOut) : "—") },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status === "In" ? "Active" : "Closed"} /> },
  ];

  return (
    <div>
      <PageHeader title="Visitor History" description="Complete visitor log" />
      <Card>
        <DataTable columns={columns} data={visitors} keyField="id" searchPlaceholder="Search history..." rowActions={[{ label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} }]} onExport={() => {}} />
      </Card>
    </div>
  );
}
