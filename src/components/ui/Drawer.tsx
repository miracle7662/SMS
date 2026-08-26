"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "480px",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}>
      <div
        className={cn("absolute inset-0 bg-slate-900/50 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full flex-col border-l border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-md)] transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ width: `min(${width}, 100vw)` }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
