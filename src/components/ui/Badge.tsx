import { cn } from "@/lib/utils";
import { Status } from "@/types";

const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
  Paid: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
  Resolved: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
  Verified: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
  Published: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
  Available: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
  Occupied: { bg: "bg-[var(--color-info-bg)]", text: "text-[var(--color-info)]", dot: "bg-[var(--color-info)]" },

  Inactive: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  Closed: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  Vacant: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  Draft: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },

  Pending: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning)]", dot: "bg-[var(--color-warning)]" },
  "In Progress": { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning)]", dot: "bg-[var(--color-warning)]" },
  Scheduled: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning)]", dot: "bg-[var(--color-warning)]" },
  Reserved: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning)]", dot: "bg-[var(--color-warning)]" },
  Uploaded: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning)]", dot: "bg-[var(--color-warning)]" },

  Unpaid: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger)]", dot: "bg-[var(--color-danger)]" },
  Overdue: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger)]", dot: "bg-[var(--color-danger)]" },
  Open: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger)]", dot: "bg-[var(--color-danger)]" },
  Expired: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger)]", dot: "bg-[var(--color-danger)]" },
};

export function StatusBadge({ status, className }: { status: Status | string; className?: string }) {
  const s = statusMap[status] ?? { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        s.bg,
        s.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "Low" | "Medium" | "High" | "Urgent" }) {
  const map = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
    High: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    Urgent: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", map[priority])}>
      {priority}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]",
        className
      )}
    >
      {children}
    </span>
  );
}
