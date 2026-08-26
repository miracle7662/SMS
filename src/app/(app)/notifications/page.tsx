"use client";

import { Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { notifications } from "@/lib/mock-data";
import { formatDateTime, cn } from "@/lib/utils";

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${notifications.filter((n) => !n.read).length} unread notifications`}
        actions={<Button variant="outline"><CheckCheck className="h-4 w-4" /> Mark all as read</Button>}
      />
      <Card>
        <div className="divide-y divide-[var(--color-border)]">
          {notifications.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-4 px-5 py-4", !n.read && "bg-[var(--color-primary)]/5")}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[var(--color-text)]">{n.title}</p>
                  <Badge>{n.module}</Badge>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />}
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{n.message}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatDateTime(n.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
