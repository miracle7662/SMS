"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Trash2, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { buildings } from "@/lib/mock-data";
import { Building } from "@/types";

export default function BuildingsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: Column<Building>[] = [
    {
      key: "name",
      header: "Building Name",
      render: (b) => (
        <span className="flex items-center gap-2 font-medium">
          <Building2 className="h-4 w-4 text-[var(--color-text-muted)]" /> {b.name}
        </span>
      ),
    },
    { key: "wings", header: "Wings", render: (b) => b.wings.join(", ") },
    { key: "totalFloors", header: "Total Floors" },
    { key: "totalFlats", header: "Total Flats" },
  ];

  return (
    <div>
      <PageHeader
        title="Buildings / Wings"
        description="Manage building and wing structure for your society"
        actions={
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" /> Add Building
          </Button>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          data={buildings}
          keyField="id"
          searchPlaceholder="Search buildings..."
          rowActions={[
            { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
          onExport={() => {}}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Building / Wing"
        description="Create a new building or wing under this society"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>Save Building</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Building Name" placeholder="e.g. Sunrise Tower C" required />
          <Input label="Number of Wings" type="number" placeholder="e.g. 2" required />
          <Input label="Total Floors" type="number" placeholder="e.g. 14" required />
          <Input label="Flats per Floor" type="number" placeholder="e.g. 4" required />
          <Select
            label="Society"
            options={[{ label: "Green Valley Co-operative Housing Society", value: "SOC001" }]}
            defaultValue="SOC001"
          />
        </div>
      </Drawer>
    </div>
  );
}
