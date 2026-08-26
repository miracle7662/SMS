"use client";

import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "primary" | "success";
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            tone === "danger" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          )}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
        <div className="mt-3 flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
        {description && <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-[var(--color-text-secondary)]">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-skeleton rounded-md bg-[var(--color-border)]", className)} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-3 p-5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
