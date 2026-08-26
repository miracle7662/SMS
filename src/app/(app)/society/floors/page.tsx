"use client";

import { Plus, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { buildings, flats } from "@/lib/mock-data";

interface FloorRow {
  id: string;
  building: string;
  floor: number;
  flatCount: number;
}

const floorRows: FloorRow[] = buildings.flatMap((b) =>
  Array.from({ length: b.totalFloors }).map((_, i) => ({
    id: `${b.id}-F${i + 1}`,
    building: b.name,
    floor: i + 1,
    flatCount: flats.filter((f) => f.building === b.name && f.floor === i + 1).length,
  }))
).filter((r) => r.flatCount > 0);

export default function FloorsPage() {
  const columns: Column<FloorRow>[] = [
    { key: "building", header: "Building", render: (r) => (
      <span className="flex items-center gap-2 font-medium"><Layers className="h-4 w-4 text-[var(--color-text-muted)]" /> {r.building}</span>
    ) },
    { key: "floor", header: "Floor No." },
    { key: "flatCount", header: "Flats on this Floor" },
  ];

  return (
    <div>
      <PageHeader
        title="Floors"
        description="View and manage floor configuration across buildings"
        actions={<Button><Plus className="h-4 w-4" /> Add Floor</Button>}
      />
      <Card>
        <DataTable columns={columns} data={floorRows} keyField="id" searchPlaceholder="Search floors..." onExport={() => {}} />
      </Card>
    </div>
  );
}
