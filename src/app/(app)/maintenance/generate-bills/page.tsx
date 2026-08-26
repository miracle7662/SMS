"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Checkbox } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { flats } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

const STEPS = [
  "Select Financial Year",
  "Select Month",
  "Select Buildings/Wings/Flats",
  "Calculate Charges",
  "Preview Bills",
  "Generate Bills",
  "Send Notifications",
];

export default function GenerateBillsPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedFlats, setSelectedFlats] = useState<Set<string>>(new Set(flats.slice(0, 20).map((f) => f.id)));
  const [generated, setGenerated] = useState(false);

  const previewFlats = flats.filter((f) => selectedFlats.has(f.id)).slice(0, 20);
  const perFlatAmount = 4500;
  const totalAmount = previewFlats.length * perFlatAmount;

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div>
      <PageHeader title="Generate Bills" description="Step-by-step wizard to generate maintenance bills for a billing cycle" />

      {/* Stepper */}
      <div className="mb-6 table-scroll scrollbar-none">
        <div className="flex min-w-max items-center gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    i < step
                      ? "bg-[var(--color-success)] text-white"
                      : i === step
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn("max-w-[90px] text-center text-[11px]", i === step ? "font-medium text-[var(--color-text)]" : "text-[var(--color-text-muted)]")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="mx-2 h-px w-8 bg-[var(--color-border)]" />}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardBody>
          {step === 0 && (
            <div className="max-w-sm">
              <Select
                label="Financial Year"
                required
                options={[{ label: "FY 2026-27", value: "2026-27" }, { label: "FY 2025-26", value: "2025-26" }]}
                defaultValue="2026-27"
                helpText="Bills will be generated under this financial year"
              />
            </div>
          )}

          {step === 1 && (
            <div className="max-w-sm">
              <Select
                label="Billing Month"
                required
                options={["August 2026", "September 2026", "October 2026"].map((m) => ({ label: m, value: m }))}
                defaultValue="August 2026"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                Select the flats to include in this billing cycle. {selectedFlats.size} of {flats.length} flats selected.
              </p>
              <div className="max-h-80 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
                {flats.map((f) => (
                  <label
                    key={f.id}
                    className="flex cursor-pointer items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5 last:border-0 hover:bg-[var(--color-bg)]"
                  >
                    <Checkbox
                      checked={selectedFlats.has(f.id)}
                      onChange={(v) => {
                        setSelectedFlats((prev) => {
                          const next = new Set(prev);
                          if (v) next.add(f.id);
                          else next.delete(f.id);
                          return next;
                        });
                      }}
                      label={`${f.flatNo} — ${f.building}`}
                    />
                    <span className="text-xs text-[var(--color-text-secondary)]">{f.ownerName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                Charges are calculated based on active charge rules for each flat type.
              </p>
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-bg)]">
                    <tr className="text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                      <th className="px-4 py-2.5">Charge</th>
                      <th className="px-4 py-2.5">Basis</th>
                      <th className="px-4 py-2.5 text-right">Avg. Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Monthly Maintenance", "Per Sq. Ft.", 3200],
                      ["Sinking Fund", "Fixed", 450],
                      ["Repair Fund", "Fixed", 350],
                      ["Water Charge", "Flat Type Based", 500],
                    ].map(([label, basis, amt]) => (
                      <tr key={label as string} className="border-t border-[var(--color-border)]">
                        <td className="px-4 py-2.5 text-[var(--color-text)]">{label}</td>
                        <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{basis}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-[var(--color-text)]">{formatCurrency(amt as number)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/60">
                      <td className="px-4 py-2.5 font-semibold text-[var(--color-text)]" colSpan={2}>Total per flat (avg.)</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[var(--color-text)]">{formatCurrency(perFlatAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                Preview of {previewFlats.length} bills to be generated for August 2026.
              </p>
              <div className="table-scroll max-h-80 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="sticky top-0 bg-[var(--color-bg)]">
                    <tr className="text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                      <th className="px-4 py-2.5">Flat</th>
                      <th className="px-4 py-2.5">Owner</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewFlats.map((f) => (
                      <tr key={f.id} className="border-t border-[var(--color-border)]">
                        <td className="px-4 py-2.5 text-[var(--color-text)]">{f.flatNo}</td>
                        <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{f.ownerName}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-[var(--color-text)]">{formatCurrency(perFlatAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-primary)]/5 px-4 py-3">
                <span className="text-sm font-medium text-[var(--color-text)]">Total Billing Amount</span>
                <span className="text-base font-semibold text-[var(--color-primary)]">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              {generated ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)]">
                    <Check className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[var(--color-text)]">{previewFlats.length} bills generated successfully</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Bills are now visible under All Bills.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Click below to generate {previewFlats.length} bills for August 2026 totalling {formatCurrency(totalAmount)}.
                  </p>
                  <Button onClick={() => setGenerated(true)}>Generate {previewFlats.length} Bills</Button>
                </>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Send className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-text)]">Send bill notifications to members</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Notify members via SMS and email that their bill is ready.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push("/maintenance/bills")}>Skip for now</Button>
                <Button onClick={() => router.push("/maintenance/bills")}>Send Notifications</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {step < 6 && (
        <div className="mt-5 flex items-center justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={next} disabled={step === 5 && !generated}>
            {step === 5 ? "Continue" : "Next"} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
