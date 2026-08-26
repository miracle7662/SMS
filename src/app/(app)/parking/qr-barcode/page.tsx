"use client";

import { QrCode, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { vehicles } from "@/lib/mock-data";

export default function QrBarcodePage() {
  return (
    <div>
      <PageHeader title="QR / Barcode" description="Generate QR codes for vehicle entry/exit scanning" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {vehicles.slice(0, 8).map((v) => (
          <Card key={v.id}>
            <CardBody className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                <QrCode className="h-14 w-14" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{v.vehicleNo}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{v.flatNo}</p>
              </div>
              <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Download</Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
