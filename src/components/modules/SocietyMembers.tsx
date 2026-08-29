"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Checkbox, Input, Select } from "@/components/ui/Input";
import { formatDate, initials } from "@/lib/utils";
import { getSocietySession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
export type MemberType = "OWNER" | "CO_OWNER" | "TENANT";
type FlatOption = { id: number; flat_no: string; building_name: string; wing_name: string };
type MemberRow = { id: number; member_code: string; name: string; mobile: string; email: string | null; flat_id: number; flat_no: string; building_name: string; wing_name: string; member_type: MemberType; ownership_percentage: number | null; occupancy_start: string | null; occupancy_end: string | null; agreement_status: string; police_noc_status: string; is_primary: boolean; status: "ACTIVE" | "INACTIVE" };
const labels: Record<MemberType, string> = { OWNER: "Owner", CO_OWNER: "Co-Owner", TENANT: "Tenant" };

export function SocietyMembers({ type, title = "All Members" }: { type?: MemberType; title?: string }) {
  const [rows, setRows] = useState<MemberRow[]>([]); const [flats, setFlats] = useState<FlatOption[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", mobile: "", email: "", flat_id: "", member_type: type ?? "OWNER" as MemberType, ownership_percentage: "100", occupancy_start: "", occupancy_end: "", agreement_status: "NOT_REQUIRED", police_noc_status: "NOT_REQUIRED", is_primary: true });

  const loadData = useCallback(async () => {
    const session = getSocietySession();
    if (!session?.accessToken || !session.activeSociety) { setError("Please select a society first."); setLoading(false); return; }
    try {
      const headers = { Authorization: `Bearer ${session.accessToken}` }; const query = type ? `?type=${type}` : "";
      const [membersResponse, flatsResponse] = await Promise.all([fetch(`${API_URL}/society/members${query}`, { headers }), fetch(`${API_URL}/society/flats`, { headers })]);
      const [membersResult, flatsResult] = await Promise.all([membersResponse.json(), flatsResponse.json()]);
      if (!membersResponse.ok || !membersResult.success) throw new Error(membersResult.message || "Unable to load members.");
      if (!flatsResponse.ok || !flatsResult.success) throw new Error(flatsResult.message || "Unable to load flats.");
      setRows(membersResult.data ?? []); setFlats(flatsResult.data ?? []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load members."); }
    finally { setLoading(false); }
  }, [type]);
  useEffect(() => { void loadData(); }, [loadData]);

  const openCreate = () => { const memberType = type ?? "OWNER"; setForm({ name: "", mobile: "", email: "", flat_id: "", member_type: memberType, ownership_percentage: memberType === "TENANT" ? "" : "100", occupancy_start: "", occupancy_end: "", agreement_status: memberType === "TENANT" ? "PENDING" : "NOT_REQUIRED", police_noc_status: memberType === "TENANT" ? "PENDING" : "NOT_REQUIRED", is_primary: memberType === "OWNER" }); setError(""); setSuccess(""); setDrawerOpen(true); };
  async function submit(event: FormEvent) {
    event.preventDefault(); const session = getSocietySession(); if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    setSaving(true); setError("");
    try {
      const response = await fetch(`${API_URL}/society/members`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` }, body: JSON.stringify({ ...form, flat_id: Number(form.flat_id), ownership_percentage: form.ownership_percentage ? Number(form.ownership_percentage) : null }) });
      const result = await response.json(); if (!response.ok || !result.success) throw new Error(Array.isArray(result.errors) ? result.errors.join(", ") : result.message || "Unable to add member.");
      setDrawerOpen(false); setSuccess(`${labels[form.member_type]} assigned to flat successfully.`); await loadData();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to add member."); } finally { setSaving(false); }
  }
  async function remove(row: MemberRow) {
    if (!window.confirm(`Remove ${row.name}'s ${labels[row.member_type]} assignment from flat ${row.flat_no}?`)) return;
    const session = getSocietySession(); if (!session?.accessToken) return setError("Your session is missing.");
    try { const response = await fetch(`${API_URL}/society/members/${row.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.accessToken}` } }); const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Unable to remove member."); setSuccess("Member assignment removed successfully."); await loadData(); }
    catch (removeError) { setError(removeError instanceof Error ? removeError.message : "Unable to remove member."); }
  }
  const columns: Column<MemberRow>[] = [
    { key: "name", header: "Member", render: (row) => <span className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-semibold text-[var(--color-primary)]">{initials(row.name)}</span><span><span className="block font-medium">{row.name}</span><span className="block text-xs text-[var(--color-text-secondary)]">{row.member_code}</span></span></span> },
    { key: "flat_no", header: "Flat", render: (row) => `${row.wing_name}-${row.flat_no}` }, { key: "building_name", header: "Building" }, { key: "mobile", header: "Mobile" },
    { key: "member_type", header: "Type", render: (row) => <Badge>{labels[row.member_type]}</Badge> }, { key: "ownership_percentage", header: "Ownership", render: (row) => row.ownership_percentage ? `${row.ownership_percentage}%` : "—" },
    { key: "occupancy_end", header: "End Date", render: (row) => row.member_type === "TENANT" && row.occupancy_end ? formatDate(row.occupancy_end) : "—" }, { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status === "ACTIVE" ? "Active" : "Inactive"} /> },
  ];
  const isTenant = form.member_type === "TENANT";
  return <div>
    <PageHeader title={title} description={`${rows.length} flat-member assignments in the selected society`} actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add {type ? labels[type] : "Member"}</Button>} />
    {error && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">{error}</p>}{success && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{success}</p>}
    <Card><DataTable columns={columns} data={rows} keyField="id" searchFields={["name", "mobile", "flat_no", "building_name"]} searchPlaceholder={loading ? "Loading members..." : "Search members..."} filters={!type ? [{ key: "member_type", label: "Member Type", options: ["OWNER","CO_OWNER","TENANT"] }] : undefined} rowActions={[{ label: "Remove Assignment", icon: <Trash2 className="h-4 w-4" />, onClick: (row) => void remove(row), danger: true }]} /></Card>
    <Drawer open={drawerOpen} onClose={() => !saving && setDrawerOpen(false)} title={`Add ${type ? labels[type] : "Member"}`} footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" form="member-form" loading={saving}>Save Assignment</Button></>}>
      <form id="member-form" onSubmit={submit} className="flex flex-col gap-4">
        <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input label="Mobile Number" required inputMode="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /><Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Select label="Flat" required value={form.flat_id} onChange={(e) => setForm({ ...form, flat_id: e.target.value })} placeholder="Select flat" options={flats.map((flat) => ({ value: String(flat.id), label: `${flat.building_name} / ${flat.wing_name} / ${flat.flat_no}` }))} />
        {!type && <Select label="Member Type" required value={form.member_type} onChange={(e) => { const member_type = e.target.value as MemberType; setForm({ ...form, member_type, ownership_percentage: member_type === "TENANT" ? "" : "100", agreement_status: member_type === "TENANT" ? "PENDING" : "NOT_REQUIRED", police_noc_status: member_type === "TENANT" ? "PENDING" : "NOT_REQUIRED" }); }} options={Object.entries(labels).map(([value, label]) => ({ value, label }))} />}
        {!isTenant && <Input label="Ownership Percentage" type="number" min="0.01" max="100" step="0.01" value={form.ownership_percentage} onChange={(e) => setForm({ ...form, ownership_percentage: e.target.value })} />}
        {isTenant && <><Input label="Agreement Start" type="date" value={form.occupancy_start} onChange={(e) => setForm({ ...form, occupancy_start: e.target.value })} /><Input label="Agreement End" type="date" value={form.occupancy_end} onChange={(e) => setForm({ ...form, occupancy_end: e.target.value })} /><Select label="Agreement Status" value={form.agreement_status} onChange={(e) => setForm({ ...form, agreement_status: e.target.value })} options={["PENDING","VERIFIED","EXPIRED"].map((value) => ({ value, label: value }))} /><Select label="Police NOC" value={form.police_noc_status} onChange={(e) => setForm({ ...form, police_noc_status: e.target.value })} options={["PENDING","VERIFIED"].map((value) => ({ value, label: value }))} /></>}
        <Checkbox checked={form.is_primary} onChange={(is_primary) => setForm({ ...form, is_primary })} label="Primary member for this flat" />
      </form>
    </Drawer>
  </div>;
}
