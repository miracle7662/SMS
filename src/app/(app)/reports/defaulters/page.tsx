import { ReportShell } from "@/components/modules/ReportShell";
import { BillsList } from "@/components/modules/BillsList";

export default function DefaultersReportPage() {
  return (
    <ReportShell title="Defaulters Report" description="Flats with overdue or unpaid maintenance">
      <BillsList statuses={["Overdue", "Unpaid"]} />
    </ReportShell>
  );
}
