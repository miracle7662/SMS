"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-[var(--radius)]";

    const variants = {
      primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm",
      secondary: "bg-[var(--secondary)] text-white hover:opacity-90 shadow-sm",
      outline: "border border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[var(--border-light)]",
      ghost: "text-[var(--text-secondary)] hover:bg-[var(--border-light)] hover:text-[var(--text)]",
      danger: "bg-[var(--danger)] text-white hover:opacity-90 shadow-sm",
      success: "bg-[var(--success)] text-white hover:opacity-90 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
