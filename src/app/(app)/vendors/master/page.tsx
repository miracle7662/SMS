"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { vendors } from "@/lib/mock-data";
import { Vendor } from "@/types";

export default function VendorMasterPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<Vendor>[] = [
    { key: "name", header: "Vendor Name" },
    { key: "service", header: "Service" },
    { key: "contact", header: "Contact Person" },
    { key: "mobile", header: "Mobile", render: (v) => (
      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]"><Phone className="h-3.5 w-3.5" /> {v.mobile}</span>
    ) },
    { key: "email", header: "Email", render: (v) => (
      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]"><Mail className="h-3.5 w-3.5" /> {v.email}</span>
    ) },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Vendor Master" description="Vendors and contractors servicing the society" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Vendor</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={vendors}
          keyField="id"
          searchPlaceholder="Search vendors..."
          filters={[{ key: "service", label: "Service", options: Array.from(new Set(vendors.map((v) => v.service))) }, { key: "status", label: "Status", options: ["Active", "Inactive"] }]}
          rowActions={[
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Vendor" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save Vendor</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Vendor / Company Name" required />
          <Select label="Service Category" required options={["Plumbing", "Electrical", "Housekeeping", "Security", "Gardening", "Lift Maintenance"].map((s) => ({ label: s, value: s }))} />
          <Input label="Contact Person" required />
          <Input label="Mobile Number" required />
          <Input label="Email" type="email" />
        </div>
      </Drawer>
    </div>
  );
}
