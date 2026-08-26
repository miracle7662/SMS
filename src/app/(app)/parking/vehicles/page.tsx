"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Car } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { vehicles } from "@/lib/mock-data";
import { Vehicle } from "@/types";

export default function VehiclesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<Vehicle>[] = [
    { key: "vehicleNo", header: "Vehicle No.", render: (v) => (
      <span className="flex items-center gap-2 font-medium"><Car className="h-4 w-4 text-[var(--color-text-muted)]" /> {v.vehicleNo}</span>
    ) },
    { key: "type", header: "Type", render: (v) => <Badge>{v.type}</Badge> },
    { key: "brand", header: "Brand" },
    { key: "model", header: "Model" },
    { key: "color", header: "Color" },
    { key: "ownerName", header: "Owner" },
    { key: "flatNo", header: "Flat" },
  ];

  return (
    <div>
      <PageHeader title="Vehicles" description="All vehicles registered by members" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Vehicle</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={vehicles}
          keyField="id"
          searchPlaceholder="Search vehicles..."
          filters={[{ key: "type", label: "Type", options: ["Car", "Bike", "Scooter"] }]}
          rowActions={[
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
          onExport={() => {}}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Vehicle" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save Vehicle</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Vehicle Number" required placeholder="MH12AB1234" />
          <Select label="Vehicle Type" required options={["Car", "Bike", "Scooter", "Other"].map((t) => ({ label: t, value: t }))} />
          <Input label="Brand" placeholder="e.g. Maruti Suzuki" />
          <Input label="Model" placeholder="e.g. Swift" />
          <Input label="Color" placeholder="e.g. White" />
          <Select label="Flat" required options={[{ label: "A-1203", value: "A-1203" }]} />
        </div>
      </Drawer>
    </div>
  );
}
