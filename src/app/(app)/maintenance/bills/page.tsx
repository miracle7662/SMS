import { PageHeader } from "@/components/layout/PageHeader";
import { BillsList } from "@/components/modules/BillsList";

export default function AllBillsPage() {
  return (
    <div>
      <PageHeader title="All Bills" description="Every maintenance bill generated for the society" />
      <BillsList />
    </div>
  );
}
