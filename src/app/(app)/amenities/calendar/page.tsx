"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { bookings } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";

export default function BookingCalendarPage() {
  const days = Array.from({ length: 30 }).map((_, i) => i + 1);
  const bookingsByDay = (day: number) =>
    bookings.filter((b) => new Date(b.date).getDate() === day);

  return (
    <div>
      <PageHeader title="Booking Calendar" description="August 2026 — amenity bookings by day" />
      <Card>
        <CardHeader title="August 2026" />
        <div className="grid grid-cols-7 gap-px bg-[var(--color-border)] p-px">
          {days.map((day) => {
            const dayBookings = bookingsByDay(day);
            return (
              <div key={day} className="min-h-[92px] bg-[var(--color-card)] p-2">
                <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">{day}</p>
                {dayBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className="mb-1 truncate rounded bg-[var(--color-primary)]/10 px-1.5 py-0.5 text-[10px] text-[var(--color-primary)]">
                    {b.amenityName}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
