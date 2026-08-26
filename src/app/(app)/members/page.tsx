"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { members } from "@/lib/mock-data";
import { Member } from "@/types";
import { initials } from "@/lib/utils";

export default function AllMembersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Member",
      render: (m) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-semibold text-[var(--color-primary)]">
            {initials(m.name)}
          </span>
          <span>
            <span className="block font-medium text-[var(--color-text)]">{m.name}</span>
            <span className="block text-xs text-[var(--color-text-secondary)]">{m.email}</span>
          </span>
        </span>
      ),
    },
    { key: "flatNo", header: "Flat No." },
    { key: "building", header: "Building" },
    { key: "mobile", header: "Mobile" },
    { key: "type", header: "Type", render: (m) => <Badge>{m.type}</Badge> },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="All Members"
        description={`${members.length} members across the society`}
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Member</Button>}
      />

      <Card>
        <DataTable
          columns={columns}
          data={members}
          keyField="id"
          searchPlaceholder="Search members by name, flat, mobile..."
          filters={[
            { key: "type", label: "Member Type", options: ["Owner", "Co-Owner", "Tenant", "Family Member"] },
            { key: "status", label: "Status", options: ["Active", "Inactive"] },
          ]}
          rowActions={[
            { label: "View Profile", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Remove", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
          bulkActions={[{ label: "Export Selected", onClick: () => {} }]}
          onExport={() => {}}
          onImport={() => {}}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Member"
        footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save Member</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Input label="Full Name" required />
          <Input label="Mobile Number" required />
          <Input label="Email Address" type="email" />
          <Select label="Flat No." options={[{ label: "A-1203", value: "A-1203" }]} required />
          <Select label="Member Type" options={["Owner", "Co-Owner", "Tenant", "Family Member"].map((t) => ({ label: t, value: t }))} required />
        </div>
      </Drawer>
    </div>
  );
}
