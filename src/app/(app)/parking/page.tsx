import { SquareParking, CheckCircle2, Car, IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { parkingSlots } from "@/lib/mock-data";

export default function ParkingDashboardPage() {
  const total = parkingSlots.length;
  const available = parkingSlots.filter((p) => p.status === "Available").length;
  const occupied = parkingSlots.filter((p) => p.status === "Occupied").length;
  const reserved = parkingSlots.filter((p) => p.status === "Reserved").length;

  return (
    <div>
      <PageHeader title="Parking" description="Parking slot allocation overview" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={SquareParking} title="Total Slots" value={String(total)} tone="primary" />
        <StatCard icon={CheckCircle2} title="Available" value={String(available)} tone="success" />
        <StatCard icon={Car} title="Occupied" value={String(occupied)} tone="info" />
        <StatCard icon={IndianRupee} title="Reserved / Paid Parking" value={String(reserved)} tone="warning" />
      </div>

      <Card>
        <div className="grid grid-cols-4 gap-2 p-5 sm:grid-cols-8 lg:grid-cols-10">
          {parkingSlots.map((s) => (
            <div
              key={s.id}
              title={`${s.slotNo} — ${s.status}${s.flatNo ? ` (${s.flatNo})` : ""}`}
              className={`flex aspect-square items-center justify-center rounded-[var(--radius-sm)] border text-[10px] font-medium ${
                s.status === "Available"
                  ? "border-[var(--color-success)]/30 bg-[var(--color-success-bg)] text-[var(--color-success)]"
                  : s.status === "Reserved"
                  ? "border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
                  : "border-[var(--color-info)]/30 bg-[var(--color-info-bg)] text-[var(--color-info)]"
              }`}
            >
              {s.slotNo}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
