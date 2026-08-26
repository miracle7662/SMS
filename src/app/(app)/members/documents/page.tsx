"use client";

import { Eye, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { tenants } from "@/lib/mock-data";
import { Tenant } from "@/types";

interface DocRow {
  id: string;
  memberName: string;
  flatNo: string;
  docType: string;
  status: string;
}

const docs: DocRow[] = tenants.flatMap((t: Tenant, i) => [
  { id: `${t.id}-agreement`, memberName: t.name, flatNo: t.flatNo, docType: "Legal Rent Agreement", status: t.agreementStatus },
  { id: `${t.id}-noc`, memberName: t.name, flatNo: t.flatNo, docType: "Police NOC", status: t.policeNoc },
  { id: `${t.id}-aadhaar`, memberName: t.name, flatNo: t.flatNo, docType: "Aadhaar Card", status: i % 3 === 0 ? "Pending" : "Verified" },
]);

export default function MemberDocumentsPage() {
  const columns: Column<DocRow>[] = [
    { key: "memberName", header: "Member" },
    { key: "flatNo", header: "Flat No." },
    { key: "docType", header: "Document Type" },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Member Documents"
        description="Identity, agreement, and verification documents for members and tenants"
        actions={<Button><Upload className="h-4 w-4" /> Upload Document</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          data={docs}
          keyField="id"
          searchPlaceholder="Search documents..."
          filters={[{ key: "docType", label: "Document Type", options: ["Legal Rent Agreement", "Police NOC", "Aadhaar Card"] }, { key: "status", label: "Status", options: ["Uploaded", "Verified", "Pending", "Expired"] }]}
          rowActions={[
            { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Download", icon: <Download className="h-4 w-4" />, onClick: () => {} },
          ]}
          onExport={() => {}}
        />
      </Card>
    </div>
  );
}
