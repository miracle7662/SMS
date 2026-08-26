"use client";

import { useRouter } from "next/navigation";
import { Eye, UserPlus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { complaints } from "@/lib/mock-data";
import { Complaint } from "@/types";
import { formatDate } from "@/lib/utils";

export function ComplaintsList({ type, statuses }: { type?: Complaint["type"]; statuses?: Complaint["status"][] }) {
  const router = useRouter();
  let data = complaints;
  if (type) data = data.filter((c) => c.type === type);
  if (statuses) data = data.filter((c) => statuses.includes(c.status));

  const columns: Column<Complaint>[] = [
    { key: "complaintNo", header: "Complaint No." },
    { key: "complainant", header: "Complainant" },
    { key: "type", header: "Type" },
    { key: "flatNo", header: "Flat" },
    { key: "category", header: "Category" },
    { key: "priority", header: "Priority", render: (c) => <PriorityBadge priority={c.priority} /> },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "createdDate", header: "Created", render: (c) => formatDate(c.createdDate), sortAccessor: (c) => c.createdDate },
    { key: "assignedTo", header: "Assigned To", render: (c) => c.assignedTo ?? "Unassigned" },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        searchPlaceholder="Search complaints..."
        filters={[
          { key: "status", label: "Status", options: ["Open", "In Progress", "Resolved", "Closed"] },
          { key: "priority", label: "Priority", options: ["Low", "Medium", "High", "Urgent"] },
          { key: "category", label: "Category", options: Array.from(new Set(complaints.map((c) => c.category))) },
        ]}
        onRowClick={(c) => router.push(`/complaints/${c.id}`)}
        rowActions={[
          { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: (c) => router.push(`/complaints/${c.id}`) },
          { label: "Assign", icon: <UserPlus className="h-4 w-4" />, onClick: () => {} },
          { label: "Mark Resolved", icon: <CheckCircle2 className="h-4 w-4" />, onClick: () => {} },
        ]}
        bulkActions={[{ label: "Assign", onClick: () => {} }, { label: "Close Selected", onClick: () => {} }]}
        onExport={() => {}}
      />
    </Card>
  );
}
