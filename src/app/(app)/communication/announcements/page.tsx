"use client";

import { Megaphone, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { notices } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";

export default function AnnouncementsPage() {
  return (
    <div>
      <PageHeader title="Announcements" description="Society-wide announcements and updates" actions={<Button><Plus className="h-4 w-4" /> New Announcement</Button>} />
      <div className="flex flex-col gap-4">
        {notices.slice(0, 4).map((n) => (
          <Card key={n.id}>
            <CardBody className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{n.title}</p>
                  <StatusBadge status={n.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{n.description}</p>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">Posted {formatDate(n.publishDate)}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
