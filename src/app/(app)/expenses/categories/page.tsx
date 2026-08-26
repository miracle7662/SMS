"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { expenses } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface CatRow {
  id: string;
  name: string;
  totalSpend: number;
  entries: number;
}

const categoryNames = Array.from(new Set(expenses.map((e) => e.category)));
const rows: CatRow[] = categoryNames.map((name, i) => ({
  id: `EC${i}`,
  name,
  totalSpend: expenses.filter((e) => e.category === name).reduce((s, e) => s + e.amount, 0),
  entries: expenses.filter((e) => e.category === name).length,
}));

export default function ExpenseCategoriesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<CatRow>[] = [
    { key: "name", header: "Category" },
    { key: "entries", header: "Total Entries" },
    { key: "totalSpend", header: "Total Spend", render: (r) => formatCurrency(r.totalSpend) },
  ];

  return (
    <div>
      <PageHeader title="Expense Categories" description="Categorize society expenses for reporting" actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Category</Button>} />
      <Card>
        <DataTable columns={columns} data={rows} keyField="id" searchPlaceholder="Search categories..." rowActions={[{ label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) }, { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true }]} />
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Category" footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save</Button></>}>
        <Input label="Category Name" required placeholder="e.g. Landscaping" />
      </Drawer>
    </div>
  );
}
