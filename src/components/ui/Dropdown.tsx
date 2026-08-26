"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
}: {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-30 mt-1.5 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] py-1.5 shadow-[var(--shadow-md)]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1.5 h-px bg-[var(--color-border)]" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors hover:bg-[var(--color-bg)]",
                  item.danger ? "text-[var(--color-danger)]" : "text-[var(--color-text)]"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
