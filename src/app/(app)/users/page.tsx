"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { users } from "@/lib/mock-data";
import { User } from "@/types";
import { initials, formatDateTime } from "@/lib/utils";

export default function UsersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (u) => (
      <span className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-semibold text-[var(--color-primary)]">{initials(u.name)}</span>
        <span className="font-medium text-[var(--color-text)]">{u.name}</span>
      </span>
    ) },
    { key: "email", header: "Email" },
    { key: "mobile", header: "Mobile" },
    { key: "role", header: "Role", render: (u) => <Badge><Shield className="mr-1 h-3 w-3" /> {u.role.replace("_", " ")}</Badge> },
    { key: "lastLogin", header: "Last Login", render: (u) => (u.lastLogin ? formatDateTime(u.lastLogin) : "—") },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage user accounts and access" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add User</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={users}
          keyField="id"
          searchPlaceholder="Search users..."
          filters={[{ key: "role", label: "Role", options: Array.from(new Set(users.map((u) => u.role))) }, { key: "status", label: "Status", options: ["Active", "Inactive"] }]}
          rowActions={[
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Deactivate", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add User" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save User</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Full Name" required />
          <Input label="Email" type="email" required />
          <Input label="Mobile Number" required />
          <Select label="Role" required options={["SUPER_ADMIN", "SOCIETY_ADMIN", "CHAIRMAN", "SECRETARY", "TREASURER", "ACCOUNTANT", "SECURITY", "RESIDENT"].map((r) => ({ label: r.replace("_", " "), value: r }))} />
        </div>
      </Drawer>
    </div>
  );
}
