"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { complaints } from "@/lib/mock-data";

interface CategoryRow {
  id: string;
  name: string;
  defaultAssignee: string;
  slaHours: number;
  count: number;
}

const categoryNames = Array.from(new Set(complaints.map((c) => c.category)));
const rows: CategoryRow[] = categoryNames.map((name, i) => ({
  id: `CAT${i}`,
  name,
  defaultAssignee: ["Plumber", "Electrician", "Housekeeping Team", "Security Head", "Lift Vendor", "Civil Contractor"][i % 6],
  slaHours: [24, 12, 48, 6, 72, 8][i % 6],
  count: complaints.filter((c) => c.category === name).length,
}));

export default function ComplaintCategoriesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns: Column<CategoryRow>[] = [
    { key: "name", header: "Category" },
    { key: "defaultAssignee", header: "Default Assignee" },
    { key: "slaHours", header: "SLA (hours)" },
    { key: "count", header: "Total Complaints" },
  ];

  return (
    <div>
      <PageHeader
        title="Complaint Categories"
        description="Manage complaint categories and default assignment"
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Category</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          data={rows}
          keyField="id"
          searchPlaceholder="Search categories..."
          rowActions={[
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Category"
        footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Input label="Category Name" required placeholder="e.g. Pest Control" />
          <Select label="Default Assignee" options={["Plumber", "Electrician", "Housekeeping Team", "Security Head"].map((v) => ({ label: v, value: v }))} />
          <Input label="SLA (hours)" type="number" placeholder="24" />
        </div>
      </Drawer>
    </div>
  );
}
