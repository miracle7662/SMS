import { PageHeader } from "@/components/layout/PageHeader";
import { MembersByType } from "@/components/modules/MembersByType";

export default function CoOwnersPage() {
  return (
    <div>
      <PageHeader title="Co-Owners" description="Joint / co-owners registered against flats" />
      <MembersByType type="Co-Owner" />
    </div>
  );
}
