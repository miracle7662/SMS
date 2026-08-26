"use client";

import { Eye, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { payments } from "@/lib/mock-data";
import { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TransactionsPage() {
  const columns: Column<Payment>[] = [
    { key: "receiptNo", header: "Receipt No." },
    { key: "flatNo", header: "Flat" },
    { key: "payerName", header: "Payer" },
    { key: "mode", header: "Mode", render: (p) => <Badge>{p.mode}</Badge> },
    { key: "date", header: "Date", render: (p) => formatDate(p.date), sortAccessor: (p) => p.date },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount), sortAccessor: (p) => p.amount },
  ];

  return (
    <div>
      <PageHeader title="Payment Transactions" description="Complete transaction log of all recorded payments" />
      <Card>
        <DataTable
          columns={columns}
          data={payments}
          keyField="id"
          searchPlaceholder="Search transactions..."
          filters={[{ key: "mode", label: "Payment Mode", options: ["Cash", "Cheque", "NEFT", "UPI", "Card", "Online"] }]}
          rowActions={[
            { label: "View Receipt", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
            { label: "Download", icon: <Download className="h-4 w-4" />, onClick: () => {} },
          ]}
          onExport={() => {}}
        />
      </Card>
    </div>
  );
}
