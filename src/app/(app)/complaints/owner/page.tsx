import { PageHeader } from "@/components/layout/PageHeader";
import { ComplaintsList } from "@/components/modules/ComplaintsList";

export default function OwnerComplaintsPage() {
  return (
    <div>
      <PageHeader title="Owner Complaints" description="Complaints raised by owners" />
      <ComplaintsList type="Owner" />
    </div>
  );
}
