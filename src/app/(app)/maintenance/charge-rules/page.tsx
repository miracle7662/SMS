"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select, Switch } from "@/components/ui/Input";

interface ChargeRule {
  id: string;
  chargeType: string;
  basis: "Fixed" | "Per Sq. Ft." | "Flat Type Based";
  amount: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: "Active" | "Inactive";
}

const rules: ChargeRule[] = [
  { id: "R1", chargeType: "Monthly Maintenance", basis: "Per Sq. Ft.", amount: "₹4.50", effectiveFrom: "01-Apr-2026", effectiveTo: "31-Mar-2027", status: "Active" },
  { id: "R2", chargeType: "Sinking Fund", basis: "Fixed", amount: "₹450", effectiveFrom: "01-Apr-2026", effectiveTo: "31-Mar-2027", status: "Active" },
  { id: "R3", chargeType: "Non-Occupancy Charge", basis: "Flat Type Based", amount: "10% of Maint.", effectiveFrom: "01-Apr-2026", effectiveTo: "31-Mar-2027", status: "Active" },
  { id: "R4", chargeType: "Water Charge (1BHK)", basis: "Flat Type Based", amount: "₹350", effectiveFrom: "01-Apr-2026", effectiveTo: "31-Mar-2027", status: "Active" },
  { id: "R5", chargeType: "Water Charge (3BHK)", basis: "Flat Type Based", amount: "₹700", effectiveFrom: "01-Apr-2026", effectiveTo: "31-Mar-2027", status: "Active" },
  { id: "R6", chargeType: "Old Maintenance Rate", basis: "Per Sq. Ft.", amount: "₹4.00", effectiveFrom: "01-Apr-2025", effectiveTo: "31-Mar-2026", status: "Inactive" },
];

export default function ChargeRulesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: Column<ChargeRule>[] = [
    { key: "chargeType", header: "Charge Type" },
    { key: "basis", header: "Basis", render: (r) => <Badge>{r.basis}</Badge> },
    { key: "amount", header: "Amount" },
    { key: "effectiveFrom", header: "Effective From" },
    { key: "effectiveTo", header: "Effective To" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Charge Rules"
        description="Configure calculation rules for each charge type"
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="h-4 w-4" /> Add Charge Rule</Button>}
      />
      <Card>
        <DataTable
          columns={columns}
          data={rules}
          keyField="id"
          searchPlaceholder="Search rules..."
          filters={[{ key: "basis", label: "Basis", options: ["Fixed", "Per Sq. Ft.", "Flat Type Based"] }, { key: "status", label: "Status", options: ["Active", "Inactive"] }]}
          rowActions={[
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setDrawerOpen(true) },
            { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Charge Rule"
        width="520px"
        footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button><Button onClick={() => setDrawerOpen(false)}>Save Rule</Button></>}
      >
        <div className="flex flex-col gap-4">
          <Select label="Charge Type" required options={["Monthly Maintenance", "Sinking Fund", "Non-Occupancy Charge", "Water Charge"].map((v) => ({ label: v, value: v }))} />
          <Select label="Calculation Basis" required options={["Fixed Amount", "Per Square Feet", "Flat Type Based"].map((v) => ({ label: v, value: v }))} />
          <Input label="Amount / Rate" required placeholder="e.g. 4.50" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Effective From" type="date" required />
            <Input label="Effective To" type="date" />
          </div>
          <Switch checked={true} onChange={() => {}} label="Rule is Active" />
        </div>
      </Drawer>
    </div>
  );
}
