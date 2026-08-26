"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { notifications } from "@/lib/mock-data";
import { Notification } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function NotificationHistoryPage() {
  const columns: Column<Notification>[] = [
    { key: "title", header: "Title" },
    { key: "module", header: "Module", render: (n) => <Badge>{n.module}</Badge> },
    { key: "message", header: "Message" },
    { key: "time", header: "Sent At", render: (n) => formatDateTime(n.time), sortAccessor: (n) => n.time },
    { key: "read", header: "Read", render: (n) => (n.read ? "Yes" : "No") },
  ];

  return (
    <div>
      <PageHeader title="Notification History" description="Log of all notifications sent to members" />
      <Card>
        <DataTable columns={columns} data={notifications} keyField="id" searchPlaceholder="Search notifications..." filters={[{ key: "module", label: "Module", options: Array.from(new Set(notifications.map((n) => n.module))) }]} onExport={() => {}} />
      </Card>
    </div>
  );
}
