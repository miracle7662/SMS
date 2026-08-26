import Link from "next/link";
import { AlertOctagon, Clock, CheckCircle2, Archive, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { complaints } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function ComplaintsDashboardPage() {
  const open = complaints.filter((c) => c.status === "Open").length;
  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const closed = complaints.filter((c) => c.status === "Closed").length;

  const categoryCounts = complaints.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Complaints" description="Overview of member complaints and resolution status" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={AlertOctagon} title="Open" value={String(open)} tone="danger" />
        <StatCard icon={Clock} title="In Progress" value={String(inProgress)} tone="warning" />
        <StatCard icon={CheckCircle2} title="Resolved" value={String(resolved)} tone="success" />
        <StatCard icon={Archive} title="Closed" value={String(closed)} tone="info" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Complaints"
            action={<Link href="/complaints/all" className="text-xs font-medium text-[var(--color-primary)] flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>}
          />
          <div className="divide-y divide-[var(--color-border)]">
            {complaints.slice(0, 8).map((c) => (
              <Link key={c.id} href={`/complaints/${c.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--color-bg)]">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{c.complaintNo} — {c.category}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{c.flatNo} · {c.complainant} · {formatDate(c.createdDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="By Category" />
          <div className="flex flex-col gap-3 p-5">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">{cat}</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
