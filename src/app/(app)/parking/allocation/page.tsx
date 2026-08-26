"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { parkingSlots } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/Badge";

export default function ParkingAllocationPage() {
  const available = parkingSlots.filter((s) => s.status === "Available");
  return (
    <div>
      <PageHeader title="Parking Allocation" description="Allocate available parking slots to flats" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="New Allocation" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Flat" required options={[{ label: "A-1203 — Rajesh Deshmukh", value: "A-1203" }]} />
            <Select label="Vehicle" required options={[{ label: "MH12AB1234 — Maruti Swift", value: "v1" }]} />
            <Select label="Available Slot" required wrapperClassName="sm:col-span-2" options={available.map((s) => ({ label: `${s.slotNo} (${s.type})`, value: s.slotNo }))} />
            <div className="sm:col-span-2 flex justify-end">
              <Button>Allocate Slot</Button>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Available Slots" description={`${available.length} slots free`} />
          <div className="divide-y divide-[var(--color-border)]">
            {available.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-[var(--color-text)]">{s.slotNo}</span>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
