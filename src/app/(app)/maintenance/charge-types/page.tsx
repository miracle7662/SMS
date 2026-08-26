"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";

interface ChargeType {
  id: string;
  name: string;
  calculationBasis: string;
  defaultAmount: string;
  status: "Active" | "Inactive";
}

const chargeTypes: ChargeType[] = [
  { id: "CT1", name: "Monthly Maintenance", calculationBasis: "Per Sq. Ft.", defaultAmount: "₹4.50 / sqft", status: "Active" },
  { id: "CT2", name: "Non-Occupancy Charge", calculationBasis: "% of Maintenance", defaultAmount: "10%", status: "Active" },
  { id: "CT3", name: "Parking Charge", calculationBasis: "Fixed Amount", defaultAmount: "₹500 / month", status: "Active" },
  { id: "CT4", name: "Water Charge", calculationBasis: "Flat Type Based", defaultAmount: "₹350 – ₹700", status: "Active" },
  { id: "CT5", name: "Sinking Fund", calculationBasis: "Fixed Amount", defaultAmount: "₹450 / month", status: "Active" },
  { id: "CT6", name: "Repair Fund", calculationBasis: "Fixed Amount", defaultAmount: "₹350 / month", status: "Active" },
  { id: "CT7", name: "Late Fee", calculationBasis: "% per month", defaultAmount: "2% of due", status: "Active" },
  { id: "CT8", name: "Other Charge", calculationBasis: "Fixed Amount", defaultAmount: "Variable", status: "Inactive" },
];

export default function ChargeTypesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: Column<ChargeType>[] = [
    { key: "name", header: "Charge Type" },
    { key: "calculationBasis", header: "Calculation Basis" },
    { key: "defaultAmount", header: "Default Amount" },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Charge Types"
        description="Define the types of charges billed to members"
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Charge Type</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          data={chargeTypes}
          keyField="id"
          searchPlaceholder="Search charge types..."
          rowActions={[
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Charge Type"
        footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Input label="Charge Name" required placeholder="e.g. Clubhouse Fund" />
          <Select
            label="Calculation Basis"
            required
            options={["Fixed Amount", "Per Sq. Ft.", "Flat Type Based", "% of Maintenance"].map((v) => ({ label: v, value: v }))}
          />
          <Input label="Default Amount" required placeholder="e.g. 500" />
        </div>
      </Drawer>
    </div>
  );
}
