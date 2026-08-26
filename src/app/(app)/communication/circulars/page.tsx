"use client";

import { Eye, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { documents } from "@/lib/mock-data";
import { SocietyDocument } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CircularsPage() {
  const columns: Column<SocietyDocument>[] = [
    { key: "title", header: "Circular Title" },
    { key: "uploadedBy", header: "Issued By" },
    { key: "uploadDate", header: "Date", render: (d) => formatDate(d.uploadDate) },
    { key: "visibility", header: "Visibility" },
  ];

  return (
    <div>
      <PageHeader title="Circulars" description="Official society circulars" actions={<Button>Upload Circular</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={documents}
          keyField="id"
          searchPlaceholder="Search circulars..."
          rowActions={[
            { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Download", icon: <Download className="h-4 w-4" />, onClick: () => {} },
          ]}
        />
      </Card>
    </div>
  );
}
