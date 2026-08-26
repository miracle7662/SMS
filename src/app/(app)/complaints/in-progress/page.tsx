import { PageHeader } from "@/components/layout/PageHeader";
import { ComplaintsList } from "@/components/modules/ComplaintsList";

export default function InProgressComplaintsPage() {
  return (
    <div>
      <PageHeader title="In Progress Complaints" description="Complaints currently being worked on" />
      <ComplaintsList statuses={["In Progress"]} />
    </div>
  );
}
