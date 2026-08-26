"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { tenants } from "@/lib/mock-data";
import { Tenant } from "@/types";
import { formatDate, daysUntil, initials } from "@/lib/utils";

export default function TenantsPage() {
  const [showForm, setShowForm] = useState(false);

  const expiringSoon = tenants.filter((t) => daysUntil(t.rentEnd) > 0 && daysUntil(t.rentEnd) < 30);
  const pendingDocs = tenants.filter((t) => t.policeNoc === "Pending" || t.agreementStatus === "Pending");

  const columns: Column<Tenant>[] = [
    {
      key: "name",
      header: "Tenant Name",
      render: (t) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-semibold text-[var(--color-primary)]">
            {initials(t.name)}
          </span>
          <span className="font-medium text-[var(--color-text)]">{t.name}</span>
        </span>
      ),
    },
    { key: "flatNo", header: "Flat" },
    { key: "building", header: "Building" },
    { key: "mobile", header: "Mobile" },
    { key: "rentStart", header: "Rent Start", render: (t) => formatDate(t.rentStart), sortAccessor: (t) => t.rentStart },
    { key: "rentEnd", header: "Rent End", render: (t) => formatDate(t.rentEnd), sortAccessor: (t) => t.rentEnd },
    { key: "brokerName", header: "Broker", render: (t) => t.brokerName ?? "—", hideByDefault: true },
    { key: "agreementStatus", header: "Agreement", render: (t) => <StatusBadge status={t.agreementStatus} /> },
    { key: "policeNoc", header: "Police NOC", render: (t) => <StatusBadge status={t.policeNoc} /> },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Tenants"
        description={`${tenants.length} tenants currently residing in the society`}
        actions={
          <Link href="/members/tenants/new">
            <Button>
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </Link>
        }
      />

      {(expiringSoon.length > 0 || pendingDocs.length > 0) && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {expiringSoon.length > 0 && (
            <Card className="border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)]">
              <CardBody className="flex items-start gap-3 py-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
                <p className="text-sm text-[var(--color-text)]">
                  <strong>{expiringSoon.length} agreement(s)</strong> expiring within 30 days.
                </p>
              </CardBody>
            </Card>
          )}
          {pendingDocs.length > 0 && (
            <Card className="border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)]">
              <CardBody className="flex items-start gap-3 py-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                <p className="text-sm text-[var(--color-text)]">
                  <strong>{pendingDocs.length} tenant(s)</strong> have pending document verification.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={tenants}
          keyField="id"
          searchPlaceholder="Search tenants by name, flat, mobile..."
          filters={[
            { key: "agreementStatus", label: "Agreement Status", options: ["Verified", "Pending", "Expired"] },
            { key: "policeNoc", label: "Police NOC", options: ["Verified", "Pending"] },
            { key: "building", label: "Building", options: Array.from(new Set(tenants.map((t) => t.building))) },
          ]}
          rowActions={[
            { label: "View Profile", icon: <Eye className="h-4 w-4" />, onClick: () => setShowForm(true) },
            { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: () => setShowForm(true) },
            { label: "Remove Tenant", icon: <Trash2 className="h-4 w-4" />, onClick: () => {}, danger: true },
          ]}
          bulkActions={[{ label: "Send Reminder", onClick: () => {} }, { label: "Export Selected", onClick: () => {} }]}
          onExport={() => {}}
          onImport={() => {}}
        />
      </Card>
    </div>
  );
}
