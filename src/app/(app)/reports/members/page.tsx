"use client";

import { ReportShell } from "@/components/modules/ReportShell";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { members } from "@/lib/mock-data";
import { Member } from "@/types";

const columns: Column<Member>[] = [
  { key: "name", header: "Name" },
  { key: "flatNo", header: "Flat" },
  { key: "building", header: "Building" },
  { key: "type", header: "Type", render: (m) => <Badge>{m.type}</Badge> },
  { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
];

export default function MembersReportPage() {
  return (
    <ReportShell title="Members Report" description={`${members.length} members registered`}>
      <Card>
        <DataTable columns={columns} data={members} keyField="id" searchPlaceholder="Search members..." />
      </Card>
    </ReportShell>
  );
}
