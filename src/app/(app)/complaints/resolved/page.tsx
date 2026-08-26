import { PageHeader } from "@/components/layout/PageHeader";
import { ComplaintsList } from "@/components/modules/ComplaintsList";

export default function ResolvedComplaintsPage() {
  return (
    <div>
      <PageHeader title="Resolved Complaints" description="Complaints marked resolved" />
      <ComplaintsList statuses={["Resolved", "Closed"]} />
    </div>
  );
}
