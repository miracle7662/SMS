"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Trash2, Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { notices } from "@/lib/mock-data";
import { Notice } from "@/types";
import { formatDate } from "@/lib/utils";

export default function NoticesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: Column<Notice>[] = [
    {
      key: "title",
      header: "Title",
      render: (n) => (
        <span className="flex items-center gap-2 font-medium">
          <Bell className="h-4 w-4 text-[var(--color-text-muted)]" /> {n.title}
        </span>
      ),
    },
    { key: "noticeType", header: "Type", render: (n) => <Badge>{n.noticeType}</Badge> },
    { key: "publishDate", header: "Publish Date", render: (n) => formatDate(n.publishDate), sortAccessor: (n) => n.publishDate },
    { key: "expiryDate", header: "Expiry Date", render: (n) => formatDate(n.expiryDate), sortAccessor: (n) => n.expiryDate },
    { key: "recipients", header: "Recipients" },
    { key: "status", header: "Status", render: (n) => <StatusBadge status={n.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Notices"
        description="Publish and manage society notices"
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> New Notice</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          data={notices}
          keyField="id"
          searchPlaceholder="Search notices..."
          filters={[{ key: "status", label: "Status", options: ["Published", "Scheduled", "Draft", "Expired"] }, { key: "noticeType", label: "Type", options: ["Tenant Notice", "Owner Notice", "All Members", "Building/Wing", "Specific Flat"] }]}
          rowActions={[
            { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Notice"
        width="560px"
        footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Save as Draft</Button><Button onClick={() => setDrawerOpen(false)}>Publish Notice</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Input label="Title" required placeholder="e.g. Water Supply Interruption" />
          <Textarea label="Description" required />
          <Select label="Notice Type" required options={["Tenant Notice", "Owner Notice", "All Members", "Building/Wing", "Specific Flat"].map((v) => ({ label: v, value: v }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Publish Date" type="date" required />
            <Input label="Expiry Date" type="date" required />
          </div>
          <FileUpload label="Attachment" />
        </div>
      </Drawer>
    </div>
  );
}
