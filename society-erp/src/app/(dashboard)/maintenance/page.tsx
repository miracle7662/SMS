import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Construction } from "lucide-react";

export default function ModulePage() {
  return (
    <div>
      <PageHeader
        title="Module"
        description="This module is scaffolded and ready for full implementation."
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Module" },
        ]}
      />
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Construction}
            title="Module Scaffold Ready"
            description="Navigation, layout and design system are in place. Connect APIs and expand this page module-by-module."
          />
        </CardContent>
      </Card>
    </div>
  );
}
