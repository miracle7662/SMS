import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsByCategory } from "@/components/modules/DocumentsByCategory";

export default function AGMDocumentsPage() {
  return (
    <div>
      <PageHeader title="AGM Documents" description="Annual General Meeting minutes and notices" />
      <DocumentsByCategory category="AGM Documents" />
    </div>
  );
}
