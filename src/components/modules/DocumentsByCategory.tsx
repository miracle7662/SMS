"use client";

import { Eye, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { documents } from "@/lib/mock-data";
import { SocietyDocument } from "@/types";
import { formatDate } from "@/lib/utils";

export function DocumentsByCategory({ category }: { category: string }) {
  const data = documents.filter((d) => d.category === category);

  const columns: Column<SocietyDocument>[] = [
    { key: "title", header: "Title" },
    { key: "uploadedBy", header: "Uploaded By" },
    { key: "uploadDate", header: "Upload Date", render: (d) => formatDate(d.uploadDate) },
    { key: "visibility", header: "Visibility" },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={data}
        keyField="id"
        searchPlaceholder="Search documents..."
        rowActions={[
          { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
          { label: "Download", icon: <Download className="h-4 w-4" />, onClick: () => {} },
        ]}
      />
    </Card>
  );
}
