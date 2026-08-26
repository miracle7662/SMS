"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Textarea, Switch } from "@/components/ui/Input";
import { amenities } from "@/lib/mock-data";
import { Amenity } from "@/types";

export default function AmenityMasterPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<Amenity>[] = [
    { key: "name", header: "Amenity Name" },
    { key: "description", header: "Description" },
    { key: "capacity", header: "Capacity" },
    { key: "bookable", header: "Bookable", render: (a) => (a.bookable ? "Yes" : "No") },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Amenity Master" description="Manage the list of amenities available to members" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Amenity</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={amenities}
          keyField="id"
          searchPlaceholder="Search amenities..."
          rowActions={[
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Amenity" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Amenity Name" required />
          <Textarea label="Description" />
          <Input label="Capacity" type="number" required />
          <Switch checked={true} onChange={() => {}} label="Allow Online Booking" />
        </div>
      </Drawer>
    </div>
  );
}
