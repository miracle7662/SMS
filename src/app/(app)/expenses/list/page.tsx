"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { expenses, vendors } from "@/lib/mock-data";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExpensesListPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<Expense>[] = [
    { key: "category", header: "Category", render: (e) => <Badge>{e.category}</Badge> },
    { key: "description", header: "Description" },
    { key: "vendor", header: "Vendor" },
    { key: "date", header: "Date", render: (e) => formatDate(e.date), sortAccessor: (e) => e.date },
    { key: "amount", header: "Amount", render: (e) => formatCurrency(e.amount), sortAccessor: (e) => e.amount },
    { key: "paymentStatus", header: "Payment Status", render: (e) => <StatusBadge status={e.paymentStatus} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Expenses"
        description={`Total spend this month: ${formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}`}
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Expense</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          data={expenses}
          keyField="id"
          searchPlaceholder="Search expenses..."
          filters={[{ key: "category", label: "Category", options: Array.from(new Set(expenses.map((e) => e.category))) }, { key: "paymentStatus", label: "Status", options: ["Paid", "Pending"] }]}
          rowActions={[
            { label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
          onExport={() => {}}
        />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Expense" width="520px" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save Expense</Button></>}>
        <div className="flex flex-col gap-4">
          <Select label="Category" required options={Array.from(new Set(expenses.map((e) => e.category))).map((c) => ({ label: c, value: c }))} />
          <Select label="Vendor" required options={vendors.map((v) => ({ label: v.name, value: v.name }))} />
          <Textarea label="Description" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" required />
            <Input label="Date" type="date" required />
          </div>
          <FileUpload label="Invoice / Bill" />
        </div>
      </Drawer>
    </div>
  );
}
