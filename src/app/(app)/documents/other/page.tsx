import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsByCategory } from "@/components/modules/DocumentsByCategory";

export default function OtherDocumentsPage() {
  return (
    <div>
      <PageHeader title="Other Documents" description="Miscellaneous society documents" />
      <DocumentsByCategory category="Other Documents" />
    </div>
  );
}
