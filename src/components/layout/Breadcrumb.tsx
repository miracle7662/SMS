"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

function titleCase(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
      <Link href="/dashboard" className="flex items-center gap-1 hover:text-[var(--color-text)]">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-[var(--color-text)]">{titleCase(seg)}</span>
            ) : (
              <Link href={href} className="hover:text-[var(--color-text)]">
                {titleCase(seg)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
