"use client";

import { Plus, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { vehicles } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

interface CouponRow {
  id: string;
  couponNo: string;
  vehicleNo: string;
  flatNo: string;
  validTill: string;
  status: "Active" | "Expired";
}

const rows: CouponRow[] = vehicles.slice(0, 12).map((v, i) => ({
  id: v.id,
  couponNo: `PC-2026-${1000 + i}`,
  vehicleNo: v.vehicleNo,
  flatNo: v.flatNo,
  validTill: new Date(2027, 2, 31).toISOString(),
  status: i % 6 === 0 ? "Expired" : "Active",
}));

export default function ParkingCouponsPage() {
  const columns: Column<CouponRow>[] = [
    { key: "couponNo", header: "Coupon No." },
    { key: "vehicleNo", header: "Vehicle" },
    { key: "flatNo", header: "Flat" },
    { key: "validTill", header: "Valid Till", render: (r) => formatDate(r.validTill) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Parking Coupons" description="Issued parking coupons for the year" actions={<Button><Plus className="h-4 w-4" /> Issue Coupon</Button>} />
      <Card>
        <DataTable columns={columns} data={rows} keyField="id" searchPlaceholder="Search coupons..." rowActions={[{ label: "View", icon: <Eye className="h-4 w-4" />, onClick: () => {} }]} />
      </Card>
    </div>
  );
}
