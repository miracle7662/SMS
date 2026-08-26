"use client";

import { Eye, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { flats } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface NOCRow {
  id: string;
  flatNo: string;
  building: string;
  ownerName: string;
  occupancy: string;
  ncPercent: number;
  ncAmount: number;
  status: "Active" | "Inactive";
}

const rows: NOCRow[] = flats
  .filter((f) => f.occupancy === "Rented")
  .map((f, i) => ({
    id: f.id,
    flatNo: f.flatNo,
    building: f.building,
    ownerName: f.ownerName,
    occupancy: f.occupancy,
    ncPercent: 10,
    ncAmount: 320 + (i % 4) * 80,
    status: "Active",
  }));

export default function NonOccupancyPage() {
  const columns: Column<NOCRow>[] = [
    { key: "flatNo", header: "Flat" },
    { key: "building", header: "Building" },
    { key: "ownerName", header: "Owner" },
    { key: "occupancy", header: "Occupancy" },
    { key: "ncPercent", header: "NOC %", render: (r) => `${r.ncPercent}%` },
    { key: "ncAmount", header: "NOC Amount", render: (r) => formatCurrency(r.ncAmount) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Non-Occupancy Charges" description="Charges applicable to rented / non-owner-occupied flats" />
      <Card>
        <DataTable
          columns={columns}
          data={rows}
          keyField="id"
          searchPlaceholder="Search flats..."
          rowActions={[
            { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Edit Rate", icon: <Pencil className="h-4 w-4" />, onClick: () => {} },
          ]}
        />
      </Card>
    </div>
  );
}
