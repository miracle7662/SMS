import { PageHeader } from "@/components/layout/PageHeader";
import { MembersByType } from "@/components/modules/MembersByType";

export default function FamilyMembersPage() {
  return (
    <div>
      <PageHeader title="Family Members" description="Family members residing with owners or tenants" />
      <MembersByType type="Family Member" />
    </div>
  );
}
