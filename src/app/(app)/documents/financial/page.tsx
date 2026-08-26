import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsByCategory } from "@/components/modules/DocumentsByCategory";

export default function FinancialDocumentsPage() {
  return (
    <div>
      <PageHeader title="Financial Documents" description="Audited statements and financial records" />
      <DocumentsByCategory category="Financial Documents" />
    </div>
  );
}
