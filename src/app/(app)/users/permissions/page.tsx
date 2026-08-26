"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Input";

const MODULES = ["Society Setup", "Members", "Maintenance", "Payments", "Complaints", "Communication", "Parking", "Visitors", "Amenities", "Vendors", "Expenses", "Documents", "Reports", "Users & Roles"];
const ROLES = ["Society Admin", "Chairman", "Secretary", "Treasurer", "Accountant", "Security", "Resident"];

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader title="Permissions" description="Module-level access control by role" actions={<Button>Save Permissions</Button>} />
      <Card>
        <div className="table-scroll">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                <th className="sticky left-0 bg-[var(--color-bg)] px-5 py-3">Module</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-4 py-3 text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => (
                <tr key={m} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="sticky left-0 bg-[var(--color-card)] px-5 py-3 font-medium text-[var(--color-text)]">{m}</td>
                  {ROLES.map((r, j) => (
                    <td key={r} className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Checkbox checked={j < 2 || (j === 4 && i < 4) || i === ROLES.length} onChange={() => {}} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
