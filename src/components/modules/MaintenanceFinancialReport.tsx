"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Printer, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { getSocietySession } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type ReportView = "collection" | "defaulters";

type Collection = {
  id: number;
  receipt_number: string;
  payer_name: string;
  flat_no: string;
  wing_name: string;
  building_name: string;
  payment_date: string;
  payment_mode: string;
  reference_number: string | null;
  total_amount: number;
  status: string;
};

type Due = {
  id: number;
  bill_number: string;
  recipient_name: string | null;
  flat_no: string;
  wing_name: string;
  building_name: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  overdue_days: number;
  status: string;
};

type SummaryData = {
  bill_count: number;
  billed_total: number;
  payment_count: number;
  collected_total: number;
  reversed_total: number;
  outstanding_bill_count: number;
  outstanding_total: number;
  overdue_total: number;
  overdue_bill_count: number;
  collection_rate: number;
};

type MonthlyTrend = {
  period: string;
  billed: number;
  collected: number;
};

type ReportData = {
  summary: SummaryData;
  monthly_trend: MonthlyTrend[];
  collections: Collection[];
  outstanding: Due[];
};

type MaintenanceFinancialReportProps = {
  view: ReportView;
};

const emptyReportData: ReportData = {
  summary: {
    bill_count: 0,
    billed_total: 0,
    payment_count: 0,
    collected_total: 0,
    reversed_total: 0,
    outstanding_bill_count: 0,
    outstanding_total: 0,
    overdue_total: 0,
    overdue_bill_count: 0,
    collection_rate: 0,
  },
  monthly_trend: [],
  collections: [],
  outstanding: [],
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getFinancialYearStart(): string {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const financialYear =
    currentMonth >= 3 ? currentYear : currentYear - 1;

  return `${financialYear}-04-01`;
}

function formatTitle(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function parseApiResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message: "Invalid response received from the server.",
    };
  }
}

function escapeCsvValue(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function MaintenanceFinancialReport({
  view,
}: MaintenanceFinancialReportProps) {
  const [from, setFrom] = useState(getFinancialYearStart);
  const [to, setTo] = useState(() => toIsoDate(new Date()));
  const [data, setData] = useState<ReportData>(emptyReportData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isCollectionView = view === "collection";

  const loadReport = useCallback(async () => {
    const session = getSocietySession();

    if (!session?.accessToken) {
      setError("Please login and select a society.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        from,
        to,
      });

      const response = await fetch(
        `${API_URL}/society/reports/maintenance?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          cache: "no-store",
        },
      );

      const result = await parseApiResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load maintenance report.",
        );
      }

      setData({
        summary: {
          ...emptyReportData.summary,
          ...(result.data?.summary ?? {}),
        },
        monthly_trend: result.data?.monthly_trend ?? [],
        collections: result.data?.collections ?? [],
        outstanding: result.data?.outstanding ?? [],
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load maintenance report.",
      );
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  function resetDateRange() {
    setFrom(getFinancialYearStart());
    setTo(toIsoDate(new Date()));
  }

  function exportCsv() {
    const headers = isCollectionView
      ? [
          "Receipt",
          "Date",
          "Building",
          "Flat",
          "Payer",
          "Mode",
          "Reference",
          "Amount",
          "Status",
        ]
      : [
          "Bill",
          "Due Date",
          "Building",
          "Flat",
          "Member",
          "Bill Amount",
          "Paid",
          "Balance",
          "Overdue Days",
          "Status",
        ];

    const rows: Array<Array<string | number>> = isCollectionView
      ? data.collections.map((collection) => [
          collection.receipt_number,
          collection.payment_date,
          collection.building_name,
          `${collection.wing_name}-${collection.flat_no}`,
          collection.payer_name,
          collection.payment_mode,
          collection.reference_number ?? "",
          collection.total_amount,
          collection.status,
        ])
      : data.outstanding.map((due) => [
          due.bill_number,
          due.due_date,
          due.building_name,
          `${due.wing_name}-${due.flat_no}`,
          due.recipient_name ?? "",
          due.total_amount,
          due.paid_amount,
          due.balance_amount,
          due.overdue_days,
          due.status,
        ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const csvBlob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8",
    });

    const downloadUrl = URL.createObjectURL(csvBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = `${view}-${from}-to-${to}.csv`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(downloadUrl);
  }

  const collectionColumns: Column<Collection>[] = [
    {
      key: "receipt_number",
      header: "Receipt",
    },
    {
      key: "payment_date",
      header: "Date",
      render: (collection) => formatDate(collection.payment_date),
    },
    {
      key: "flat_no",
      header: "Flat",
      render: (collection) =>
        `${collection.wing_name}-${collection.flat_no}`,
    },
    {
      key: "payer_name",
      header: "Payer",
    },
    {
      key: "payment_mode",
      header: "Mode",
      render: (collection) => (
        <Badge>{formatTitle(collection.payment_mode)}</Badge>
      ),
    },
    {
      key: "reference_number",
      header: "Reference",
      render: (collection) => collection.reference_number || "—",
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (collection) =>
        formatCurrency(Number(collection.total_amount)),
    },
    {
      key: "status",
      header: "Status",
      render: (collection) => (
        <StatusBadge status={formatTitle(collection.status)} />
      ),
    },
  ];

  const dueColumns: Column<Due>[] = [
    {
      key: "bill_number",
      header: "Bill",
    },
    {
      key: "flat_no",
      header: "Flat",
      render: (due) => `${due.wing_name}-${due.flat_no}`,
    },
    {
      key: "recipient_name",
      header: "Member",
      render: (due) => due.recipient_name || "—",
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (due) => formatDate(due.due_date),
    },
    {
      key: "total_amount",
      header: "Bill Amount",
      render: (due) => formatCurrency(Number(due.total_amount)),
    },
    {
      key: "paid_amount",
      header: "Paid",
      render: (due) => formatCurrency(Number(due.paid_amount)),
    },
    {
      key: "balance_amount",
      header: "Balance",
      render: (due) => formatCurrency(Number(due.balance_amount)),
    },
    {
      key: "overdue_days",
      header: "Overdue",
      render: (due) =>
        due.overdue_days > 0
          ? `${due.overdue_days} days`
          : "Not due",
    },
    {
      key: "status",
      header: "Status",
      render: (due) => (
        <StatusBadge status={formatTitle(due.status)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={
          isCollectionView
            ? "Maintenance Collection Report"
            : "Outstanding & Defaulters Report"
        }
        description={
          isCollectionView
            ? `${formatCurrency(
                data.summary.collected_total,
              )} collected against ${formatCurrency(
                data.summary.billed_total,
              )} billed`
            : `${formatCurrency(
                data.summary.overdue_total,
              )} overdue across ${
                data.summary.overdue_bill_count
              } bill(s)`
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </>
        }
      />

      {error ? (
        <p className="mb-4 rounded-md bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-end gap-3">
          <Input
            label="From Date"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            wrapperClassName="w-44"
          />

          <Input
            label="To Date"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            wrapperClassName="w-44"
          />

          <Button
            onClick={() => void loadReport()}
            loading={loading}
          >
            Apply
          </Button>

          <Button variant="ghost" onClick={resetDateRange}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </CardBody>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isCollectionView ? (
          <>
            <Summary
              label="Total Billed"
              value={data.summary.billed_total}
            />

            <Summary
              label="Collected"
              value={data.summary.collected_total}
              success
            />

            <Summary
              label="Reversed"
              value={data.summary.reversed_total}
              danger
            />

            <Summary
              label="Collection Rate"
              text={`${data.summary.collection_rate}%`}
            />
          </>
        ) : (
          <>
            <Summary
              label="Outstanding"
              value={data.summary.outstanding_total}
            />

            <Summary
              label="Overdue"
              value={data.summary.overdue_total}
              danger
            />

            <Summary
              label="Outstanding Bills"
              text={String(data.summary.outstanding_bill_count)}
            />

            <Summary
              label="Overdue Bills"
              text={String(data.summary.overdue_bill_count)}
              danger
            />
          </>
        )}
      </div>

      {isCollectionView && data.monthly_trend.length > 0 ? (
        <Card className="mb-5">
          <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {data.monthly_trend.map((month) => (
              <div key={month.period} className="p-4 text-sm">
                <strong>{month.period}</strong>

                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Billed {formatCurrency(month.billed)}
                </p>

                <p className="text-xs text-[var(--color-success)]">
                  Collected {formatCurrency(month.collected)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        {isCollectionView ? (
          <DataTable<Collection>
            columns={collectionColumns}
            data={data.collections}
            keyField="id"
            searchPlaceholder={
              loading ? "Loading report..." : "Search collection report..."
            }
          />
        ) : (
          <DataTable<Due>
            columns={dueColumns}
            data={data.outstanding}
            keyField="id"
            searchPlaceholder={
              loading ? "Loading report..." : "Search defaulters report..."
            }
          />
        )}
      </Card>
    </div>
  );
}

type SummaryProps = {
  label: string;
  value?: number;
  text?: string;
  success?: boolean;
  danger?: boolean;
};

function Summary({
  label,
  value,
  text,
  success = false,
  danger = false,
}: SummaryProps) {
  const colorClass = success
    ? "text-[var(--color-success)]"
    : danger
      ? "text-[var(--color-danger)]"
      : "";

  return (
    <Card>
      <CardBody>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {label}
        </p>

        <p className={`mt-1 text-xl font-semibold ${colorClass}`}>
          {text ?? formatCurrency(value ?? 0)}
        </p>
      </CardBody>
    </Card>
  );
}