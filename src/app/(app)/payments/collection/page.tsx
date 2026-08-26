"use client";

import { useState } from "react";
import { IndianRupee, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Radio } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { maintenanceBills } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CollectionPage() {
  const [mode, setMode] = useState("UPI");
  const pendingBills = maintenanceBills.filter((b) => b.status !== "Paid").slice(0, 6);

  return (
    <div>
      <PageHeader title="Collection" description="Record a maintenance payment against an outstanding bill" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Record Payment" />
          <CardBody className="flex flex-col gap-4">
            <Input label="Search Flat / Bill No." icon={<Search className="h-4 w-4" />} placeholder="e.g. A-1203 or GVH/2026-27/1002" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Flat" required options={maintenanceBills.slice(0, 10).map((b) => ({ label: `${b.flatNo} — ${b.ownerName}`, value: b.flatNo }))} />
              <Input label="Bill No." disabled placeholder="Auto-filled" />
              <Input label="Amount (₹)" type="number" required icon={<IndianRupee className="h-4 w-4" />} placeholder="4500" />
              <Input label="Payment Date" type="date" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">Payment Mode</label>
              <div className="flex flex-wrap gap-4">
                {["Cash", "Cheque", "NEFT", "UPI", "Card", "Online"].map((m) => (
                  <Radio key={m} name="mode" checked={mode === m} onChange={() => setMode(m)} label={m} />
                ))}
              </div>
            </div>
            {mode === "Cheque" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Cheque Number" />
                <Input label="Bank Name" />
              </div>
            )}
            {(mode === "UPI" || mode === "NEFT" || mode === "Online") && <Input label="Transaction / UTR Reference No." />}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline">Save & New</Button>
              <Button>Record Payment</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Outstanding Bills" description="Quick reference" />
          <div className="divide-y divide-[var(--color-border)]">
            {pendingBills.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{b.flatNo}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Due {formatDate(b.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(b.amount)}</p>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
