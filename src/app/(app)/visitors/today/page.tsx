"use client";

import { useState } from "react";
import { Plus, LogOut, ScanEye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { visitors } from "@/lib/mock-data";
import { Visitor } from "@/types";
import { formatDate } from "@/lib/utils";

export default function TodaysVisitorsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: Column<Visitor>[] = [
    { key: "name", header: "Visitor", render: (v) => (
      <span className="flex items-center gap-2 font-medium"><ScanEye className="h-4 w-4 text-[var(--color-text-muted)]" /> {v.name}</span>
    ) },
    { key: "mobile", header: "Mobile" },
    { key: "purpose", header: "Purpose" },
    { key: "flatNo", header: "Visiting Flat" },
    { key: "checkIn", header: "Check-In", render: (v) => formatDate(v.checkIn) },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status === "In" ? "Active" : "Closed"} /> },
  ];

  return (
    <div>
      <PageHeader title="Today's Visitors" description={`${visitors.filter((v) => v.status === "In").length} visitors currently inside`} actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Log Visitor Entry</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={visitors}
          keyField="id"
          searchPlaceholder="Search visitors..."
          filters={[{ key: "status", label: "Status", options: ["In", "Out"] }]}
          rowActions={[{ label: "Check Out", icon: <LogOut className="h-4 w-4" />, onClick: () => {} }]}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Log Visitor Entry" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Check In</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Visitor Name" required />
          <Input label="Mobile Number" required />
          <Select label="Purpose" required options={["Guest", "Delivery", "Cab/Auto", "Domestic Help", "Vendor", "Courier"].map((p) => ({ label: p, value: p }))} />
          <Select label="Visiting Flat" required options={[{ label: "A-1203", value: "A-1203" }]} />
        </div>
      </Drawer>
    </div>
  );
}
