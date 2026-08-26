"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Checkbox } from "./Input";
import { Dropdown } from "./Dropdown";
import { EmptyState } from "./Feedback";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortAccessor?: (row: T) => string | number;
  hideByDefault?: boolean;
  className?: string;
}

export interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  danger?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  filters?: FilterOption[];
  onRowClick?: (row: T) => void;
  rowActions?: RowAction<T>[];
  bulkActions?: { label: string; onClick: (rows: T[]) => void; danger?: boolean }[];
  onExport?: () => void;
  onImport?: () => void;
  addButton?: React.ReactNode;
  pageSizeOptions?: number[];
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  searchPlaceholder = "Search...",
  searchFields,
  filters,
  onRowClick,
  rowActions,
  bulkActions,
  onExport,
  onImport,
  addButton,
  pageSizeOptions = [10, 25, 50],
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [selected, setSelected] = useState<Set<unknown>>(new Set());
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(
    new Set(columns.filter((c) => c.hideByDefault).map((c) => c.key))
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showColPanel, setShowColPanel] = useState(false);

  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));

  const filtered = useMemo(() => {
    let result = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) => {
        const fields = searchFields ?? (Object.keys(row) as (keyof T)[]);
        return fields.some((f) => String(row[f] ?? "").toLowerCase().includes(q));
      });
    }
    for (const [key, val] of Object.entries(activeFilters)) {
      if (val) result = result.filter((row) => String(row[key as keyof T]) === val);
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      result = [...result].sort((a, b) => {
        const av = col?.sortAccessor ? col.sortAccessor(a) : String(a[sortKey as keyof T] ?? "");
        const bv = col?.sortAccessor ? col.sortAccessor(b) : String(b[sortKey as keyof T] ?? "");
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, search, activeFilters, sortKey, sortDir, columns, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allOnPageSelected = pageData.length > 0 && pageData.every((r) => selected.has(r[keyField]));

  const toggleSelectAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) {
      pageData.forEach((r) => next.delete(r[keyField]));
    } else {
      pageData.forEach((r) => next.add(r[keyField]));
    }
    setSelected(next);
  };

  const selectedRows = data.filter((r) => selected.has(r[keyField]));

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] pl-9 pr-3 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            />
          </div>
          {filters && filters.length > 0 && (
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowFilterPanel((v) => !v)}>
                <Filter className="h-3.5 w-3.5" /> Filters
                {Object.values(activeFilters).some(Boolean) && (
                  <span className="ml-1 rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] text-white">
                    {Object.values(activeFilters).filter(Boolean).length}
                  </span>
                )}
              </Button>
              {showFilterPanel && (
                <div className="absolute left-0 z-20 mt-1.5 w-64 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-[var(--shadow-md)]">
                  <div className="flex flex-col gap-3">
                    {filters.map((f) => (
                      <div key={f.key}>
                        <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">{f.label}</label>
                        <select
                          value={activeFilters[f.key] ?? ""}
                          onChange={(e) => {
                            setActiveFilters((prev) => ({ ...prev, [f.key]: e.target.value }));
                            setPage(1);
                          }}
                          className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 text-xs focus:outline-none"
                        >
                          <option value="">All</option>
                          {f.options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => setActiveFilters({})}>
                      Clear all
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowColPanel((v) => !v)}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Columns
            </Button>
            {showColPanel && (
              <div className="absolute left-0 z-20 mt-1.5 w-56 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-[var(--shadow-md)]">
                <div className="flex flex-col gap-2">
                  {columns.map((c) => (
                    <Checkbox
                      key={c.key}
                      checked={!hiddenCols.has(c.key)}
                      onChange={(v) => {
                        setHiddenCols((prev) => {
                          const next = new Set(prev);
                          if (v) next.delete(c.key);
                          else next.add(c.key);
                          return next;
                        });
                      }}
                      label={c.header}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          )}
          {addButton}
        </div>
      </div>

      {/* Bulk actions bar */}
      {bulkActions && selected.size > 0 && (
        <div className="flex items-center justify-between bg-[var(--color-primary)]/5 px-4 py-2.5 text-sm">
          <span className="font-medium text-[var(--color-text)]">{selected.size} selected</span>
          <div className="flex gap-2">
            {bulkActions.map((a, i) => (
              <Button
                key={i}
                size="sm"
                variant={a.danger ? "danger" : "outline"}
                onClick={() => a.onClick(selectedRows)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-scroll">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/60">
              {bulkActions && (
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allOnPageSelected} onChange={toggleSelectAll} />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]", col.className)}
                >
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-[var(--color-text)]"
                  >
                    {col.header}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                </th>
              ))}
              {rowActions && <th className="w-16 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (bulkActions ? 1 : 0) + (rowActions ? 1 : 0)}>
                  <EmptyState title="No records found" description="Try adjusting your search or filters." />
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={String(row[keyField])}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-bg)]/60",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {bulkActions && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(row[keyField])}
                        onChange={(v) => {
                          const next = new Set(selected);
                          if (v) next.add(row[keyField]);
                          else next.delete(row[keyField]);
                          setSelected(next);
                        }}
                      />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-[var(--color-text)]", col.className)}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "—")}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        trigger={
                          <button className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        }
                        items={rowActions.map((a) => ({
                          label: a.label,
                          icon: a.icon,
                          danger: a.danger,
                          onClick: () => a.onClick(row),
                        }))}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <span>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-7 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-1.5 text-xs"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-xs text-[var(--color-text-secondary)]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const commonRowActions = { Eye, Pencil, Trash2 };
