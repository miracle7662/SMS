import { ReportShell } from "@/components/modules/ReportShell";
import { ComplaintsList } from "@/components/modules/ComplaintsList";

export default function ComplaintsReportPage() {
  return (
    <ReportShell title="Complaints Report" description="Complaint resolution performance">
      <ComplaintsList />
    </ReportShell>
  );
}
