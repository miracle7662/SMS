import { PageHeader } from "@/components/layout/PageHeader";
import { ComplaintsList } from "@/components/modules/ComplaintsList";

export default function AllComplaintsPage() {
  return (
    <div>
      <PageHeader title="All Complaints" description="Every complaint raised across the society" />
      <ComplaintsList />
    </div>
  );
}
