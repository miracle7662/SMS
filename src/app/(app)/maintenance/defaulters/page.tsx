import { PageHeader } from "@/components/layout/PageHeader";
import { BillsList } from "@/components/modules/BillsList";

export default function DefaultersPage() {
  return (
    <div>
      <PageHeader title="Defaulters" description="Flats with overdue maintenance payments" />
      <BillsList statuses={["Overdue"]} />
    </div>
  );
}
