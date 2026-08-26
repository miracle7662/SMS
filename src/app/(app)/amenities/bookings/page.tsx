"use client";

import { useState } from "react";
import { Plus, Eye, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Select, Input } from "@/components/ui/Input";
import { bookings, amenities } from "@/lib/mock-data";
import { Booking } from "@/types";
import { formatDate } from "@/lib/utils";

export default function BookingsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<Booking>[] = [
    { key: "amenityName", header: "Amenity" },
    { key: "flatNo", header: "Flat" },
    { key: "bookedBy", header: "Booked By" },
    { key: "date", header: "Date", render: (b) => formatDate(b.date) },
    { key: "slot", header: "Time Slot" },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Bookings" description="Amenity bookings made by members" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> New Booking</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={bookings}
          keyField="id"
          searchPlaceholder="Search bookings..."
          filters={[{ key: "status", label: "Status", options: ["Pending", "Active", "Closed"] }]}
          rowActions={[
            { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Cancel Booking", icon: <X className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="New Booking" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Confirm Booking</Button></>}>
        <div className="flex flex-col gap-4">
          <Select label="Amenity" required options={amenities.filter((a) => a.bookable).map((a) => ({ label: a.name, value: a.id }))} />
          <Select label="Flat" required options={[{ label: "A-1203", value: "A-1203" }]} />
          <Input label="Booking Date" type="date" required />
          <Select label="Time Slot" required options={[{ label: "6:00 AM - 8:00 AM", value: "s1" }, { label: "5:00 PM - 7:00 PM", value: "s2" }]} />
        </div>
      </Drawer>
    </div>
  );
}
