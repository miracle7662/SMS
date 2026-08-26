"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./Input";

export function FileUpload({
  label,
  helpText,
  accept,
  multiple,
  variant = "file",
}: {
  label?: string;
  helpText?: string;
  accept?: string;
  multiple?: boolean;
  variant?: "file" | "image";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FieldWrapper label={label} helpText={helpText}>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-6 text-center transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
      >
        {variant === "image" ? (
          <ImageIcon className="h-6 w-6 text-[var(--color-text-muted)]" />
        ) : (
          <UploadCloud className="h-6 w-6 text-[var(--color-text-muted)]" />
        )}
        <p className="text-sm text-[var(--color-text)]">
          <span className="font-medium text-[var(--color-primary)]">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {variant === "image" ? "PNG, JPG up to 5MB" : "PDF, JPG, PNG up to 10MB"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-xs"
            >
              <span className="flex items-center gap-2 truncate text-[var(--color-text)]">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
                <span className="truncate">{f.name}</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles((prev) => prev.filter((_, idx) => idx !== i));
                }}
                className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </FieldWrapper>
  );
}

export function cnDropzone(active: boolean) {
  return cn(active && "border-[var(--color-primary)] bg-[var(--color-primary)]/5");
}
