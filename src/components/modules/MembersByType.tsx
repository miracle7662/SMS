"use client";

import { Eye, Pencil, Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { members } from "@/lib/mock-data";
import { Member } from "@/types";
import { initials } from "@/lib/utils";

export function MembersByType({ type }: { type: Member["type"] }) {
  const data = members.filter((m) => m.type === type);

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Name",
      render: (m) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-semibold text-[var(--color-primary)]">
            {initials(m.name)}
          </span>
          <span className="font-medium text-[var(--color-text)]">{m.name}</span>
        </span>
      ),
    },
    { key: "flatNo", header: "Flat No." },
    { key: "building", header: "Building" },
    { key: "mobile", header: "Mobile" },
    { key: "email", header: "Email", render: (m) => (
      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]"><Mail className="h-3.5 w-3.5" /> {m.email}</span>
    ) },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        searchPlaceholder={`Search ${type.toLowerCase()}s...`}
        rowActions={[
          { label: "View Profile", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
          { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => {} },
        ]}
        onExport={() => {}}
      />
    </Card>
  );
}
