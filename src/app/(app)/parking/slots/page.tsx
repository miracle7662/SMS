"use client";

import { Plus, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { parkingSlots } from "@/lib/mock-data";
import { ParkingSlot } from "@/types";

export default function ParkingSlotsPage() {
  const columns: Column<ParkingSlot>[] = [
    { key: "slotNo", header: "Slot No." },
    { key: "type", header: "Type", render: (s) => <Badge>{s.type}</Badge> },
    { key: "flatNo", header: "Allocated To", render: (s) => s.flatNo ?? "—" },
    { key: "vehicleNo", header: "Vehicle No.", render: (s) => s.vehicleNo ?? "—" },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Parking Slots" description="Master list of all parking slots" actions={<Button><Plus className="h-4 w-4" /> Add Slot</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={parkingSlots}
          keyField="id"
          searchPlaceholder="Search slots..."
          filters={[{ key: "status", label: "Status", options: ["Available", "Occupied", "Reserved"] }, { key: "type", label: "Type", options: ["Two Wheeler", "Four Wheeler"] }]}
          rowActions={[{ label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => {} }]}
        />
      </Card>
    </div>
  );
}
