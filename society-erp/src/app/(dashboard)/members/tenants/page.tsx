"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { tenants } from "@/data/mock";
import { formatCurrency, formatDate, formatMobile } from "@/lib/utils";
import { Plus, Search, Download, MoreHorizontal, Eye, Pencil, Trash2, Filter } from "lucide-react";

export default function TenantsPage() {
  const [search, setSearch] = useState("");

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.mobile.includes(search)
  );

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Manage all tenants across the society"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Members", href: "/members" },
          { label: "Tenants" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Search by name, flat, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <select className="h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
              <option>All Status</option>
              <option>Active</option>
              <option>Expiring Soon</option>
              <option>Expired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--border-light)]/50">
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
                  <input type="checkbox" className="rounded border-[var(--border)]" />
                </th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Tenant Name</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Flat</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Building</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Mobile</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Rent Period</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Broker</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Agreement</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Police NOC</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--border-light)] hover:bg-[var(--border-light)]/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-[var(--border)]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-semibold text-[var(--primary)]">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{t.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatCurrency(t.rentAmount)}/mo</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{t.flatNumber}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{t.buildingName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatMobile(t.mobile)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    <div className="text-xs">
                      <div>{formatDate(t.rentStartDate)}</div>
                      <div>to {formatDate(t.rentEndDate)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{t.brokerName || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge status={t.agreementStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={t.policeNoc} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={t.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text)]">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text)]">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--danger)]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {filtered.length} of {tenants.length} tenants
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
