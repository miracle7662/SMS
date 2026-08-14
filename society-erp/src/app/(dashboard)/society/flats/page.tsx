"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { flats, buildings } from "@/data/mock";
import { formatMobile } from "@/lib/utils";
import { Plus, Search, Download, Eye, Pencil, Filter } from "lucide-react";
import Link from "next/link";

export default function FlatsPage() {
  const [search, setSearch] = useState("");

  const filtered = flats.filter(
    (f) =>
      f.number.toLowerCase().includes(search.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      f.wing.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Flats"
        description="Manage all flats across buildings and wings"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Society Setup" },
          { label: "Flats" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Flat
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Search flat, owner, wing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <select className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
            <option>All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id}>{b.name}</option>
            ))}
          </select>
          <select className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 text-sm">
            <option>All Status</option>
            <option>Occupied</option>
            <option>Vacant</option>
            <option>Under Renovation</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--border-light)]/50">
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Flat</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Wing</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Floor</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Type</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Area (sqft)</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Owner</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Mobile</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Occupancy</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-[var(--border-light)] hover:bg-[var(--border-light)]/40">
                  <td className="px-4 py-3 font-semibold text-[var(--primary)]">
                    <Link href={`/society/flats/${f.id}`}>{f.number}</Link>
                  </td>
                  <td className="px-4 py-3">{f.wing}</td>
                  <td className="px-4 py-3">{f.floor}</td>
                  <td className="px-4 py-3">{f.type}</td>
                  <td className="px-4 py-3">{f.areaSqft}</td>
                  <td className="px-4 py-3 font-medium">{f.ownerName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatMobile(f.ownerMobile)}</td>
                  <td className="px-4 py-3">
                    <Badge status={f.occupancyStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text)]">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text)]">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {filtered.length} of {flats.length} flats
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
