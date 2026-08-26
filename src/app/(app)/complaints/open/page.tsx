import { PageHeader } from "@/components/layout/PageHeader";
import { ComplaintsList } from "@/components/modules/ComplaintsList";

export default function OpenComplaintsPage() {
  return (
    <div>
      <PageHeader title="Open Complaints" description="Complaints awaiting assignment or action" />
      <ComplaintsList statuses={["Open"]} />
    </div>
  );
}
