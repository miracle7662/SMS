"use client";

import { Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/Input";
import { visitors } from "@/lib/mock-data";

export default function VisitorReportsPage() {
  const purposeCounts = visitors.reduce<Record<string, number>>((acc, v) => {
    acc[v.purpose] = (acc[v.purpose] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Visitor Reports" description="Analyze visitor trends over a date range" actions={<><Button variant="outline"><Printer className="h-4 w-4" /> Print</Button><Button><Download className="h-4 w-4" /> Export</Button></>} />

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-end gap-3">
          <Input label="From Date" type="date" wrapperClassName="w-40" />
          <Input label="To Date" type="date" wrapperClassName="w-40" />
          <Select label="Building" wrapperClassName="w-48" options={[{ label: "All Buildings", value: "all" }]} defaultValue="all" />
          <Button variant="outline">Apply</Button>
          <Button variant="ghost">Reset</Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="mb-4 text-sm font-semibold text-[var(--color-text)]">Visitors by Purpose</p>
          <div className="flex flex-col gap-3">
            {Object.entries(purposeCounts).map(([purpose, count]) => (
              <div key={purpose} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-[var(--color-text-secondary)]">{purpose}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${(count / visitors.length) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-sm font-medium text-[var(--color-text)]">{count}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
