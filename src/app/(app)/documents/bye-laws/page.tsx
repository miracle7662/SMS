import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsByCategory } from "@/components/modules/DocumentsByCategory";

export default function ByeLawsPage() {
  return (
    <div>
      <PageHeader title="Bye-Laws" description="Society bye-laws documents" />
      <DocumentsByCategory category="Bye-Laws" />
    </div>
  );
}
