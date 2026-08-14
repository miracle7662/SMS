import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="mb-4 rounded-full bg-[var(--border-light)] p-4">
        <Icon className="h-8 w-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
