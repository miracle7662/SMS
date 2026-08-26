import { PageHeader } from "@/components/layout/PageHeader";
import { ComplaintsList } from "@/components/modules/ComplaintsList";

export default function TenantComplaintsPage() {
  return (
    <div>
      <PageHeader title="Tenant Complaints" description="Complaints raised by tenants" />
      <ComplaintsList type="Tenant" />
    </div>
  );
}
