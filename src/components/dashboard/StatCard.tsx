import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  title,
  value,
  change,
  trend,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  tone?: "primary" | "success" | "warning" | "danger" | "info";
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
    warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
    info: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {change && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              trend === "down" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
            )}
          >
            {trend === "down" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{title}</p>
    </div>
  );
}
