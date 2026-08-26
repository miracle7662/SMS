"use client";

import { Eye, Download, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { maintenanceBills } from "@/lib/mock-data";
import { MaintenanceBill } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function BillsList({ statuses }: { statuses?: MaintenanceBill["status"][] }) {
  const data = statuses ? maintenanceBills.filter((b) => statuses.includes(b.status)) : maintenanceBills;

  const columns: Column<MaintenanceBill>[] = [
    { key: "billNo", header: "Bill No." },
    { key: "flatNo", header: "Flat" },
    { key: "building", header: "Building" },
    { key: "ownerName", header: "Owner" },
    { key: "month", header: "Month" },
    { key: "amount", header: "Amount", render: (b) => formatCurrency(b.amount), sortAccessor: (b) => b.amount },
    { key: "dueDate", header: "Due Date", render: (b) => formatDate(b.dueDate), sortAccessor: (b) => b.dueDate },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        searchPlaceholder="Search bills by flat, owner, bill no..."
        filters={[
          { key: "status", label: "Status", options: ["Paid", "Unpaid", "Overdue"] },
          { key: "building", label: "Building", options: Array.from(new Set(maintenanceBills.map((b) => b.building))) },
        ]}
        rowActions={[
          { label: "View Bill", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
          { label: "Download PDF", icon: <Download className="h-4 w-4" />, onClick: () => {} },
          { label: "Send Reminder", icon: <Send className="h-4 w-4" />, onClick: () => {} },
        ]}
        bulkActions={[{ label: "Send Reminders", onClick: () => {} }, { label: "Export Selected", onClick: () => {} }]}
        onExport={() => {}}
      />
    </Card>
  );
}
