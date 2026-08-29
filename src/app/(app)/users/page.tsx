"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Shield, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { formatDateTime, initials } from "@/lib/utils";
import { getSocietySession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type SocietyUser = {
  id: number; name: string; mobile: string; email: string | null;
  last_login: string | null; access_status: "ACTIVE" | "INACTIVE";
  joined_at: string | null; roles: string[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<SocietyUser[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    const session = getSocietySession();
    if (!session?.accessToken || !session.activeSociety) {
      setError("Please select a society before managing its users."); setLoading(false); return;
    }
    try {
      const response = await fetch(`${API_URL}/society/users`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load society users.");
      setUsers(result.data ?? []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load society users."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const openCreate = () => {
    setName(""); setMobile(""); setEmail(""); setPassword("");
    setError(""); setSuccess(""); setDrawerOpen(true);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`${API_URL}/society/users/society-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ name, mobile, email: email || null, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const validationMessage = Array.isArray(result.errors) ? result.errors.join(", ") : "";
        throw new Error(validationMessage || result.message || "Unable to assign Society Admin.");
      }
      setDrawerOpen(false); setPassword("");
      setSuccess(result.data?.account_created
        ? "New Society Admin account created and assigned successfully."
        : "Existing user account assigned as Society Admin. Existing password remains unchanged.");
      await loadUsers();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to assign Society Admin."); }
    finally { setSaving(false); }
  }

  async function changeAccess(user: SocietyUser) {
    const nextStatus = user.access_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (nextStatus === "INACTIVE" && !window.confirm(`Deactivate ${user.name}'s access to this society?`)) return;
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    setChangingId(user.id); setError(""); setSuccess("");
    try {
      const response = await fetch(`${API_URL}/society/users/${user.id}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to update user access.");
      setSuccess(`Society access ${nextStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`);
      await loadUsers();
    } catch (accessError) { setError(accessError instanceof Error ? accessError.message : "Unable to update user access."); }
    finally { setChangingId(null); }
  }

  const columns: Column<SocietyUser>[] = [
    { key: "name", header: "Name", render: (user) => <span className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-semibold text-[var(--color-primary)]">{initials(user.name)}</span><span className="font-medium text-[var(--color-text)]">{user.name}</span></span> },
    { key: "mobile", header: "Mobile" },
    { key: "email", header: "Email", render: (user) => user.email || "—" },
    { key: "roles", header: "Roles", render: (user) => <span className="flex flex-wrap gap-1">{user.roles.map((role) => <Badge key={role}><Shield className="mr-1 h-3 w-3" />{role.replaceAll("_", " ")}</Badge>)}</span> },
    { key: "last_login", header: "Last Login", render: (user) => user.last_login ? formatDateTime(user.last_login) : "Never" },
    { key: "access_status", header: "Access", render: (user) => <StatusBadge status={user.access_status === "ACTIVE" ? "Active" : "Inactive"} /> },
  ];

  return <div>
    <PageHeader title="Society Users" description="Create and manage administrators for the selected society." actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Society Admin</Button>} />
    {error && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">{error}</p>}
    {success && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{success}</p>}
    <Card><DataTable columns={columns} data={users} keyField="id" searchFields={["name", "mobile", "email"]} searchPlaceholder={loading ? "Loading users..." : "Search society users..."} filters={[{ key: "access_status", label: "Access", options: ["ACTIVE", "INACTIVE"] }]} rowActions={[
      { label: changingId ? "Updating..." : "Toggle Access", icon: <UserCheck className="h-4 w-4" />, onClick: (user) => void changeAccess(user), danger: false },
    ]} /></Card>

    <Drawer open={drawerOpen} onClose={() => !saving && setDrawerOpen(false)} title="Add Society Admin" description="Create a new account or assign an existing mobile-number account to this society." footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" form="society-admin-form" loading={saving}>Assign Society Admin</Button></>}>
      <form id="society-admin-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Mobile Number" required inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} helpText="Mobile number is the primary login ID." />
        <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Temporary Password" type="password" required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} helpText="Used only for a new account. Existing users keep their current password." />
        <div className="rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-3 text-xs text-[var(--color-text-secondary)]">
          The user will receive SOCIETY_ADMIN access only for the currently selected society. This form cannot create a SUPER_ADMIN.
        </div>
      </form>
    </Drawer>
  </div>;
}
