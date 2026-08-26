"use client";

import { Download, FileText, Printer, RotateCcw } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";

export function ReportShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
            <Button>
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </>
        }
      />

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-end gap-3">
          <Input label="From Date" type="date" wrapperClassName="w-40" />
          <Input label="To Date" type="date" wrapperClassName="w-40" />
          <Select label="Financial Year" wrapperClassName="w-36" options={[{ label: "FY 2026-27", value: "26-27" }]} defaultValue="26-27" />
          <Select label="Building" wrapperClassName="w-44" options={[{ label: "All Buildings", value: "all" }]} defaultValue="all" />
          <Select label="Wing" wrapperClassName="w-32" options={[{ label: "All", value: "all" }]} defaultValue="all" />
          <Select label="Status" wrapperClassName="w-36" options={[{ label: "All", value: "all" }]} defaultValue="all" />
          <Button variant="outline">Apply</Button>
          <Button variant="ghost">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </CardBody>
      </Card>

      {children}
    </div>
  );
}
