import { PageHeader } from "@/components/layout/PageHeader";
import { BillsList } from "@/components/modules/BillsList";

export default function PendingBillsPage() {
  return (
    <div>
      <PageHeader title="Pending Bills" description="Bills that have not yet been paid" />
      <BillsList statuses={["UNPAID", "PARTIALLY_PAID", "OVERDUE"]} />
    </div>
  );
}
