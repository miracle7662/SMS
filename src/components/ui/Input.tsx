import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface FieldWrapperProps {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, helpText, error, required, className, children }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label} {required && <span className="text-[var(--color-danger)]">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      ) : helpText ? (
        <p className="text-xs text-[var(--color-text-secondary)]">{helpText}</p>
      ) : null}
    </div>
  );
}

const fieldBase =
  "w-full rounded-[var(--radius-md)] border bg-[var(--color-card)] px-3.5 h-10 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] disabled:opacity-50 disabled:bg-[var(--color-bg)]";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  error?: string;
  wrapperClassName?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helpText, error, required, wrapperClassName, icon, ...props }, ref) => {
    return (
      <FieldWrapper label={label} helpText={helpText} error={error} required={required} className={wrapperClassName}>
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">{icon}</span>}
          <input
            ref={ref}
            className={cn(fieldBase, icon && "pl-9", error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]", className)}
            {...props}
          />
        </div>
      </FieldWrapper>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helpText, error, required, wrapperClassName, ...props }, ref) => {
    return (
      <FieldWrapper label={label} helpText={helpText} error={error} required={required} className={wrapperClassName}>
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-[var(--radius-md)] border bg-[var(--color-card)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] min-h-24",
            error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]",
            className
          )}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helpText?: string;
  error?: string;
  wrapperClassName?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helpText, error, required, wrapperClassName, options, placeholder, ...props }, ref) => {
    return (
      <FieldWrapper label={label} helpText={helpText} error={error} required={required} className={wrapperClassName}>
        <div className="relative">
          <select
            ref={ref}
            className={cn(fieldBase, "appearance-none pr-9 cursor-pointer", error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]", className)}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        </div>
      </FieldWrapper>
    );
  }
);
Select.displayName = "Select";

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5.5 w-10 rounded-full transition-colors shrink-0",
          checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-strong)]"
        )}
        style={{ height: 22, width: 40 }}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[19px]" : "translate-x-0.5"
          )}
          style={{ height: 18, width: 18, top: 2 }}
        />
      </button>
      {label && <span className="text-sm text-[var(--color-text)]">{label}</span>}
    </label>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  indeterminate,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  indeterminate?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = !!indeterminate;
        }}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[var(--color-border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30 cursor-pointer accent-[var(--color-primary)]"
      />
      {label && <span className="text-sm text-[var(--color-text)]">{label}</span>}
    </label>
  );
}

export function Radio({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
  name: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-[var(--color-border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30 cursor-pointer accent-[var(--color-primary)]"
      />
      {label && <span className="text-sm text-[var(--color-text)]">{label}</span>}
    </label>
  );
}
