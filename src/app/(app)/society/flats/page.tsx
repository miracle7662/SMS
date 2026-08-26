"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Home } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { flats, buildings } from "@/lib/mock-data";
import { Flat } from "@/types";

export default function FlatsPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: Column<Flat>[] = [
    {
      key: "flatNo",
      header: "Flat No",
      render: (f) => (
        <span className="flex items-center gap-2 font-medium">
          <Home className="h-4 w-4 text-[var(--color-text-muted)]" /> {f.flatNo}
        </span>
      ),
    },
    { key: "building", header: "Building" },
    { key: "type", header: "Type" },
    { key: "areaSqft", header: "Area (sqft)", render: (f) => `${f.areaSqft} sqft` },
    { key: "ownerName", header: "Owner" },
    { key: "occupancy", header: "Occupancy" },
    { key: "status", header: "Status", render: (f) => <StatusBadge status={f.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Flats"
        description="All flats across your society's buildings"
        actions={
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" /> Add Flat
          </Button>
        }
      />
      <Card>
        <DataTable
          columns={columns}
          data={flats}
          keyField="id"
          searchPlaceholder="Search by flat no, owner..."
          filters={[
            { key: "building", label: "Building", options: buildings.map((b) => b.name) },
            { key: "occupancy", label: "Occupancy", options: ["Owner Occupied", "Rented", "Vacant"] },
            { key: "status", label: "Status", options: ["Occupied", "Vacant"] },
          ]}
          onRowClick={(f) => router.push(`/society/flats/${f.id}`)}
          rowActions={[
            { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: (f) => router.push(`/society/flats/${f.id}`) },
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
          bulkActions={[{ label: "Export Selected", onClick: () => {} }]}
          onExport={() => {}}
          onImport={() => {}}
        />
      </Card>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Flat"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => setDrawerOpen(false)}>Save Flat</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Building" options={buildings.map((b) => ({ label: b.name, value: b.id }))} required wrapperClassName="sm:col-span-2" />
          <Input label="Flat No" placeholder="e.g. A-1203" required />
          <Input label="Floor" type="number" required />
          <Select
            label="Flat Type"
            options={["1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK"].map((t) => ({ label: t, value: t }))}
            required
          />
          <Input label="Area (sqft)" type="number" required />
          <Select
            label="Occupancy"
            options={[{ label: "Owner Occupied", value: "owner" }, { label: "Rented", value: "rented" }, { label: "Vacant", value: "vacant" }]}
            wrapperClassName="sm:col-span-2"
          />
        </div>
      </Drawer>
    </div>
  );
}
