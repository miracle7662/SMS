"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  defaultTab,
  onChange,
}: {
  tabs: { key: string; label: string; icon?: React.ReactNode; badge?: number }[];
  defaultTab?: string;
  onChange?: (key: string) => void;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);

  const select = (key: string) => {
    setActive(key);
    onChange?.(key);
  };

  return (
    <div className="table-scroll scrollbar-none border-b border-[var(--color-border)]">
      <div className="flex min-w-max gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => select(t.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active === t.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            )}
          >
            {t.icon}
            {t.label}
            {typeof t.badge === "number" && (
              <span className="ml-0.5 rounded-full bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function useTabs(tabs: { key: string }[], defaultTab?: string) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  return { active, setActive };
}
