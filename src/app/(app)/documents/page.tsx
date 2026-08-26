"use client";

import { useState } from "react";
import { Upload, Eye, Download, Trash2, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { documents } from "@/lib/mock-data";
import { SocietyDocument } from "@/types";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<SocietyDocument>[] = [
    { key: "title", header: "Title", render: (d) => (
      <span className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4 text-[var(--color-text-muted)]" /> {d.title}</span>
    ) },
    { key: "category", header: "Category", render: (d) => <Badge>{d.category}</Badge> },
    { key: "uploadedBy", header: "Uploaded By" },
    { key: "uploadDate", header: "Upload Date", render: (d) => formatDate(d.uploadDate) },
    { key: "visibility", header: "Visibility" },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Documents" description="All society documents in one place" actions={<Button onClick={() => setDrawerOpen(true)}><Upload className="h-4 w-4" /> Upload Document</Button>} />
      <Card>
        <DataTable
          columns={columns}
          data={documents}
          keyField="id"
          searchPlaceholder="Search documents..."
          filters={[{ key: "category", label: "Category", options: Array.from(new Set(documents.map((d) => d.category))) }]}
          rowActions={[
            { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Download", icon: <Download className="h-4 w-4" />, onClick: () => {} },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Upload Document" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Upload</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Document Title" required />
          <Select label="Category" required options={["Society Rules", "Bye-Laws", "AGM Documents", "Financial Documents", "Other Documents"].map((c) => ({ label: c, value: c }))} />
          <Select label="Visibility" required options={["All Owners", "All Members", "Selected Building", "Selected Flat", "Committee Only", "Admin Only"].map((v) => ({ label: v, value: v }))} />
          <FileUpload label="File" />
        </div>
      </Drawer>
    </div>
  );
}
