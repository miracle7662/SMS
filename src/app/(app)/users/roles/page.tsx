"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Textarea } from "@/components/ui/Input";
import { users } from "@/lib/mock-data";
import { Role } from "@/types";

interface RoleRow {
  id: string;
  role: Role;
  description: string;
  userCount: number;
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "Full access across all societies managed on the platform",
  SOCIETY_ADMIN: "Full administrative access within this society",
  CHAIRMAN: "Committee head with approval authority",
  SECRETARY: "Manages notices, documents, and meetings",
  TREASURER: "Oversees finances and approves expenses",
  ACCOUNTANT: "Manages billing, payments, and reconciliation",
  SECURITY: "Manages visitor entry and gate operations",
  RESIDENT: "Standard member access to own flat and society info",
};

const rows: RoleRow[] = (Object.keys(ROLE_DESCRIPTIONS) as Role[]).map((role, i) => ({
  id: `ROLE${i}`,
  role,
  description: ROLE_DESCRIPTIONS[role],
  userCount: users.filter((u) => u.role === role).length,
}));

export default function RolesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<RoleRow>[] = [
    { key: "role", header: "Role", render: (r) => (
      <span className="flex items-center gap-2 font-medium"><UsersIcon className="h-4 w-4 text-[var(--color-text-muted)]" /> {r.role.replace("_", " ")}</span>
    ) },
    { key: "description", header: "Description" },
    { key: "userCount", header: "Users Assigned" },
  ];

  return (
    <div>
      <PageHeader title="Roles" description="Predefined roles used across the ERP" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Role</Button>} />
      <Card>
        <DataTable columns={columns} data={rows} keyField="id" searchPlaceholder="Search roles..." rowActions={[{ label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) }, { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true }]} />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Role" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save Role</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Role Name" required placeholder="e.g. Facility Manager" />
          <Textarea label="Description" required />
        </div>
      </Drawer>
    </div>
  );
}
