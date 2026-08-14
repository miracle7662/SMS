import { cn } from "@/lib/utils";
import {
  Building2,
  Home,
  DoorOpen,
  Users,
  UserCheck,
  IndianRupee,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import type { KPIStat } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Home,
  DoorOpen,
  Users,
  UserCheck,
  IndianRupee,
  Clock,
  AlertCircle,
};

const colorMap = {
  primary: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  danger: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
  info: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
};

interface StatCardProps {
  stat: KPIStat;
}

export function StatCard({ stat }: StatCardProps) {
  const Icon = iconMap[stat.icon] || Building2;
  const isPositive = stat.change >= 0;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn("rounded-lg p-2.5", colorMap[stat.color])}>
          <Icon className="h-5 w-5" />
        </div>
        {stat.change !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(stat.change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--text-secondary)]">{stat.title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text)]">{stat.value}</p>
        {stat.change !== 0 && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{stat.changeLabel}</p>
        )}
      </div>
    </div>
  );
}
