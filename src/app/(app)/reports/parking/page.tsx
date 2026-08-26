"use client";

import { ReportShell } from "@/components/modules/ReportShell";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { parkingSlots } from "@/lib/mock-data";
import { ParkingSlot } from "@/types";

const columns: Column<ParkingSlot>[] = [
  { key: "slotNo", header: "Slot No." },
  { key: "type", header: "Type", render: (s) => <Badge>{s.type}</Badge> },
  { key: "flatNo", header: "Allocated To", render: (s) => s.flatNo ?? "—" },
  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
];

export default function ParkingReportPage() {
  return (
    <ReportShell title="Parking Report" description="Slot utilization across the society">
      <Card>
        <DataTable columns={columns} data={parkingSlots} keyField="id" searchPlaceholder="Search slots..." />
      </Card>
    </ReportShell>
  );
}
