import { PageHeader } from "@/components/layout/PageHeader";
import { MembersByType } from "@/components/modules/MembersByType";

export default function OwnersPage() {
  return (
    <div>
      <PageHeader title="Owners" description="All registered flat owners in the society" />
      <MembersByType type="Owner" />
    </div>
  );
}
