"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Home,
  User,
  Users,
  Wallet,
  CreditCard,
  Car,
  SquareParking,
  MessageSquareWarning,
  FileText,
  Phone,
  Mail,
  ChevronLeft,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { flats, maintenanceBills, payments, vehicles, complaints, documents } from "@/lib/mock-data";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { notFound } from "next/navigation";

const TABS = [
  { key: "overview", label: "Overview", icon: <Home className="h-4 w-4" /> },
  { key: "members", label: "Members", icon: <Users className="h-4 w-4" /> },
  { key: "owners", label: "Owners", icon: <User className="h-4 w-4" /> },
  { key: "tenants", label: "Tenants", icon: <User className="h-4 w-4" /> },
  { key: "bills", label: "Maintenance Bills", icon: <Wallet className="h-4 w-4" /> },
  { key: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { key: "vehicles", label: "Vehicles", icon: <Car className="h-4 w-4" /> },
  { key: "parking", label: "Parking", icon: <SquareParking className="h-4 w-4" /> },
  { key: "complaints", label: "Complaints", icon: <MessageSquareWarning className="h-4 w-4" /> },
  { key: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
];

export default function FlatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const flat = flats.find((f) => f.id === id);
  const [tab, setTab] = useState("overview");

  if (!flat) notFound();

  const bills = maintenanceBills.filter((b) => b.flatNo === flat.flatNo);
  const flatPayments = payments.filter((p) => p.flatNo === flat.flatNo);
  const flatVehicles = vehicles.filter((v) => v.flatNo === flat.flatNo);
  const flatComplaints = complaints.filter((c) => c.flatNo === flat.flatNo);

  return (
    <div>
      <div className="mb-4">
        <Breadcrumb />
      </div>

      <Link href="/society/flats" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
        <ChevronLeft className="h-4 w-4" /> Back to Flats
      </Link>

      {/* Header */}
      <Card className="mb-5">
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Home className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-[var(--color-text)]">{flat.flatNo}</h1>
                <StatusBadge status={flat.status} />
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {flat.building} · Wing {flat.wing} · Floor {flat.floor} · {flat.type} · {flat.areaSqft} sqft
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Generate Bill</Button>
            <Button>Edit Flat</Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Owner</p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--color-text)]">{flat.ownerName}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Occupancy</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{flat.occupancy}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Outstanding</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-danger)]">
            {formatCurrency(bills.filter((b) => b.status !== "Paid").reduce((s, b) => s + b.amount, 0))}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Open Complaints</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
            {flatComplaints.filter((c) => c.status === "Open" || c.status === "In Progress").length}
          </p>
        </div>
      </div>

      <Card>
        <div className="px-2">
          <Tabs tabs={TABS} defaultTab="overview" onChange={setTab} />
        </div>

        {tab === "overview" && (
          <CardBody className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Flat Information</h4>
              <dl className="flex flex-col gap-2 text-sm">
                <Row label="Flat No" value={flat.flatNo} />
                <Row label="Building" value={flat.building} />
                <Row label="Wing" value={flat.wing} />
                <Row label="Floor" value={String(flat.floor)} />
                <Row label="Type" value={flat.type} />
                <Row label="Area" value={`${flat.areaSqft} sqft`} />
              </dl>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-[var(--color-text)]">Owner Contact</h4>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
                  {initials(flat.ownerName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{flat.ownerName}</p>
                  <p className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                    <Phone className="h-3 w-3" /> +91 98xxxxxx21
                  </p>
                  <p className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                    <Mail className="h-3 w-3" /> owner@email.com
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        )}

        {tab === "members" && (
          <CardBody>
            <SimpleTable
              headers={["Name", "Relation", "Mobile", "Status"]}
              rows={[[flat.ownerName, "Owner", "+91 98xxxxxx21", <StatusBadge key="s" status="Active" />]]}
            />
          </CardBody>
        )}

        {tab === "owners" && (
          <CardBody>
            <SimpleTable headers={["Name", "Ownership %", "Mobile", "Status"]} rows={[[flat.ownerName, "100%", "+91 98xxxxxx21", <StatusBadge key="s" status="Active" />]]} />
          </CardBody>
        )}

        {tab === "tenants" && (
          <CardBody>
            {flat.occupancy === "Rented" ? (
              <SimpleTable headers={["Name", "Mobile", "Rent Start", "Rent End", "Status"]} rows={[["Tenant details linked to this flat", "—", "—", "—", <StatusBadge key="s" status="Active" />]]} />
            ) : (
              <EmptyState title="No tenants" description="This flat currently has no registered tenant." />
            )}
          </CardBody>
        )}

        {tab === "bills" && (
          <CardBody>
            {bills.length === 0 ? (
              <EmptyState title="No bills generated" />
            ) : (
              <SimpleTable
                headers={["Bill No", "Month", "Amount", "Due Date", "Status"]}
                rows={bills.map((b) => [b.billNo, b.month, formatCurrency(b.amount), formatDate(b.dueDate), <StatusBadge key={b.id} status={b.status} />])}
              />
            )}
          </CardBody>
        )}

        {tab === "payments" && (
          <CardBody>
            {flatPayments.length === 0 ? (
              <EmptyState title="No payments recorded" />
            ) : (
              <SimpleTable
                headers={["Receipt No", "Amount", "Mode", "Date"]}
                rows={flatPayments.map((p) => [p.receiptNo, formatCurrency(p.amount), p.mode, formatDate(p.date)])}
              />
            )}
          </CardBody>
        )}

        {tab === "vehicles" && (
          <CardBody>
            {flatVehicles.length === 0 ? (
              <EmptyState title="No vehicles registered" />
            ) : (
              <SimpleTable
                headers={["Vehicle No", "Type", "Brand / Model", "Color"]}
                rows={flatVehicles.map((v) => [v.vehicleNo, v.type, `${v.brand} ${v.model}`, v.color])}
              />
            )}
          </CardBody>
        )}

        {tab === "parking" && (
          <CardBody>
            <EmptyState title="No parking slot allocated" description="Allocate a parking slot for this flat from the Parking module." />
          </CardBody>
        )}

        {tab === "complaints" && (
          <CardBody>
            {flatComplaints.length === 0 ? (
              <EmptyState title="No complaints raised" />
            ) : (
              <SimpleTable
                headers={["Complaint No", "Category", "Priority", "Status"]}
                rows={flatComplaints.map((c) => [c.complaintNo, c.category, c.priority, <StatusBadge key={c.id} status={c.status} />])}
              />
            )}
          </CardBody>
        )}

        {tab === "documents" && (
          <CardBody>
            <SimpleTable
              headers={["Title", "Category", "Status"]}
              rows={documents.slice(0, 3).map((d) => [d.title, d.category, <StatusBadge key={d.id} status={d.status} />])}
            />
          </CardBody>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--color-border)] py-1.5 last:border-0">
      <dt className="text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="font-medium text-[var(--color-text)]">{value}</dd>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="table-scroll">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-[var(--color-text)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
