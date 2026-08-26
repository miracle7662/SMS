"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { payments } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReconciliationPage() {
  const bankStatementTotal = payments.reduce((s, p) => s + p.amount, 0) - 4500;
  const systemTotal = payments.reduce((s, p) => s + p.amount, 0);
  const matched = payments.length - 1;

  return (
    <div>
      <PageHeader title="Reconciliation" description="Match recorded payments against bank statement entries" actions={<Button>Upload Bank Statement</Button>} />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardBody><p className="text-xs text-[var(--color-text-secondary)]">System Total</p><p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{formatCurrency(systemTotal)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs text-[var(--color-text-secondary)]">Bank Statement Total</p><p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{formatCurrency(bankStatementTotal)}</p></CardBody></Card>
        <Card><CardBody><p className="text-xs text-[var(--color-text-secondary)]">Unmatched Amount</p><p className="mt-1 text-xl font-semibold text-[var(--color-danger)]">{formatCurrency(systemTotal - bankStatementTotal)}</p></CardBody></Card>
      </div>

      <Card>
        <CardHeader title="Reconciliation Status" description={`${matched} of ${payments.length} transactions matched`} />
        <div className="divide-y divide-[var(--color-border)]">
          {payments.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                {i === payments.length - 1 ? (
                  <AlertCircle className="h-4 w-4 text-[var(--color-warning)]" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{p.receiptNo} — {p.payerName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(p.date)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(p.amount)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
