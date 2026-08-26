import { ReportShell } from "@/components/modules/ReportShell";
import { Card } from "@/components/ui/Card";
import { CollectionChart } from "@/components/dashboard/CollectionChart";
import { maintenanceBills } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function MaintenanceCollectionReportPage() {
  const collected = maintenanceBills.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const total = maintenanceBills.reduce((s, b) => s + b.amount, 0);
  return (
    <ReportShell title="Maintenance Collection Report" description={`${formatCurrency(collected)} collected of ${formatCurrency(total)} billed`}>
      <Card><div className="p-5"><CollectionChart /></div></Card>
    </ReportShell>
  );
}
