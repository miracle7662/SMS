"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { complaints } from "@/data/mock";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Download, Eye, Filter } from "lucide-react";

export default function ComplaintsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.complaintNo.toLowerCase().includes(search.toLowerCase()) ||
      c.complainant.toLowerCase().includes(search.toLowerCase()) ||
      c.flatNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Track and resolve member complaints"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Complaints" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Complaint
            </Button>
          </>
        }
      />

      {/* Status tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Open", "Assigned", "In Progress", "Resolved", "Closed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border-light)]"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 text-xs opacity-80">
                ({complaints.filter((c) => c.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--border)] p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="Search complaint no, name, flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--border-light)]/50">
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Complaint No</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Complainant</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Type</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Flat</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Category</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Priority</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Created</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Assigned To</th>
                <th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border-light)] hover:bg-[var(--border-light)]/40">
                  <td className="px-4 py-3 font-medium text-[var(--primary)]">{c.complaintNo}</td>
                  <td className="px-4 py-3">{c.complainant}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c.type}</td>
                  <td className="px-4 py-3 font-medium">{c.flatNumber}</td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3">
                    <Badge status={c.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c.assignedTo || "—"}</td>
                  <td className="px-4 py-3">
                    <button className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--border-light)] hover:text-[var(--text)]">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {filtered.length} of {complaints.length} complaints
          </p>
        </div>
      </Card>
    </div>
  );
}
