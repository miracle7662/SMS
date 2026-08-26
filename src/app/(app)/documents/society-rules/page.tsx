import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsByCategory } from "@/components/modules/DocumentsByCategory";

export default function SocietyRulesPage() {
  return (
    <div>
      <PageHeader title="Society Rules" description="Rules and regulations governing the society" />
      <DocumentsByCategory category="Society Rules" />
    </div>
  );
}
