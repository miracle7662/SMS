"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { flats } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

interface PreApproved {
  id: string;
  name: string;
  mobile: string;
  flatNo: string;
  expectedDate: string;
  status: "Expected" | "Arrived" | "Expired";
}

const rows: PreApproved[] = flats.slice(0, 10).map((f, i) => ({
  id: f.id,
  name: ["Ramesh (Plumber)", "Amazon Delivery", "Dr. Sharma", "Cousin Visit", "AC Service", "Zomato Delivery"][i % 6],
  mobile: `98${(20000000 + i * 111).toString().slice(0, 8)}`,
  flatNo: f.flatNo,
  expectedDate: new Date(2026, 7, 15 + (i % 10)).toISOString(),
  status: i % 3 === 0 ? "Arrived" : "Expected",
}));

export default function PreApprovedVisitorsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<PreApproved>[] = [
    { key: "name", header: "Visitor Name" },
    { key: "mobile", header: "Mobile" },
    { key: "flatNo", header: "Flat" },
    { key: "expectedDate", header: "Expected On", render: (r) => formatDate(r.expectedDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status === "Arrived" ? "Active" : "Pending"} /> },
  ];

  return (
    <div>
      <PageHeader title="Pre-Approved Visitors" description="Visitors approved in advance by residents" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Pre-Approval</Button>} />
      <Card>
        <DataTable columns={columns} data={rows} keyField="id" searchPlaceholder="Search..." rowActions={[{ label: "Remove", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true }]} />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Pre-Approval" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Visitor Name" required />
          <Input label="Mobile Number" />
          <Select label="Flat" required options={[{ label: "A-1203", value: "A-1203" }]} />
          <Input label="Expected Date" type="date" required />
        </div>
      </Drawer>
    </div>
  );
}
