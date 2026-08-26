"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { amenities } from "@/lib/mock-data";

interface Slot {
  id: string;
  amenity: string;
  slot: string;
  maxBookings: number;
}

const slots: Slot[] = [
  { id: "S1", amenity: "Clubhouse Banquet Hall", slot: "10:00 AM - 2:00 PM", maxBookings: 1 },
  { id: "S2", amenity: "Clubhouse Banquet Hall", slot: "5:00 PM - 9:00 PM", maxBookings: 1 },
  { id: "S3", amenity: "Swimming Pool", slot: "6:00 AM - 8:00 AM", maxBookings: 15 },
  { id: "S4", amenity: "Swimming Pool", slot: "5:00 PM - 7:00 PM", maxBookings: 15 },
  { id: "S5", amenity: "Badminton Court", slot: "6:00 AM - 7:00 AM", maxBookings: 4 },
  { id: "S6", amenity: "Badminton Court", slot: "7:00 PM - 8:00 PM", maxBookings: 4 },
];

export default function TimeSlotsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<Slot>[] = [
    { key: "amenity", header: "Amenity" },
    { key: "slot", header: "Time Slot" },
    { key: "maxBookings", header: "Max Bookings" },
  ];

  return (
    <div>
      <PageHeader title="Time Slots" description="Configure bookable time slots for each amenity" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Slot</Button>} />
      <Card>
        <DataTable columns={columns} data={slots} keyField="id" searchPlaceholder="Search slots..." rowActions={[{ label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) }, { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true }]} />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Time Slot" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save</Button></>}>
        <div className="flex flex-col gap-4">
          <Select label="Amenity" required options={amenities.map((a) => ({ label: a.name, value: a.id }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" required />
            <Input label="End Time" type="time" required />
          </div>
          <Input label="Max Bookings" type="number" required />
        </div>
      </Drawer>
    </div>
  );
}
