import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { amenities } from "@/lib/mock-data";
import { Dumbbell } from "lucide-react";

export default function AmenitiesDashboardPage() {
  return (
    <div>
      <PageHeader title="Amenities" description="Society amenities and facility booking overview" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((a) => (
          <Card key={a.id}>
            <CardBody>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{a.name}</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{a.description}</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">Capacity: {a.capacity} · {a.bookable ? "Bookable" : "Walk-in"}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
