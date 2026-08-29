"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type Society = {
  id: number;
  society_code: string;
  society_name: string;
  city?: string | null;
  state?: string | null;
  status: string;
  memberCount?: number;
};

type SocietyForm = {
  society_code: string;
  society_name: string;
  registration_no: string;
  registration_type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pan_number: string;
  email: string;
  mobile: string;
  established_date: string;
};

const EMPTY_FORM: SocietyForm = {
  society_code: "",
  society_name: "",
  registration_no: "",
  registration_type: "Co-operative Housing Society",
  address: "",
  city: "",
  state: "Maharashtra",
  pincode: "",
  pan_number: "",
  email: "",
  mobile: "",
  established_date: "",
};

function getSession() {
  const storages = [window.localStorage, window.sessionStorage];
  for (const storage of storages) {
    const token = storage.getItem("society_access_token");
    if (!token) continue;
    try {
      const roles = JSON.parse(storage.getItem("society_platform_roles") || "[]");
      return { token, isSuperAdmin: Array.isArray(roles) && roles.includes("SUPER_ADMIN") };
    } catch {
      return { token, isSuperAdmin: false };
    }
  }
  return null;
}

export default function SuperAdminSocietiesPage() {
  const router = useRouter();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [form, setForm] = useState<SocietyForm>(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSocieties = useCallback(async () => {
    const session = getSession();
    if (!session?.token) {
      router.replace("/login");
      return;
    }
    if (!session.isSuperAdmin) {
      router.replace("/dashboard");
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_URL}/platform/societies`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load societies.");
      setSocieties(result.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load societies.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSocieties();
  }, [loadSocieties]);

  const updateField = (field: keyof SocietyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSession();
    if (!session?.token) return router.replace("/login");

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/platform/societies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const validationMessage = Array.isArray(result.errors) ? result.errors.join(", ") : "";
        throw new Error(validationMessage || result.message || "Unable to create society.");
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      setSuccess("Society created successfully. You can now select it and add a Society Admin.");
      await loadSocieties();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to create society.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Society Management"
        description="Create and manage societies from the Super Admin account."
        actions={<Button onClick={() => { setError(""); setModalOpen(true); }}><Plus className="h-4 w-4" /> Add New Society</Button>}
      />

      {error && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">{error}</p>}
      {success && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{success}</p>}

      {loading ? (
        <Card><CardBody className="py-12 text-center text-sm text-[var(--color-text-secondary)]">Loading societies...</CardBody></Card>
      ) : societies.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center py-14 text-center">
            <div className="rounded-full bg-[var(--color-primary)]/10 p-4 text-[var(--color-primary)]"><Building2 className="h-7 w-7" /></div>
            <h2 className="mt-4 text-base font-semibold text-[var(--color-text)]">No society created yet</h2>
            <p className="mt-1 max-w-md text-sm text-[var(--color-text-secondary)]">Create the first society before adding its administrator, buildings, flats or members.</p>
            <Button className="mt-5" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Create First Society</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {societies.map((society) => (
            <Card key={society.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]"><Building2 className="h-5 w-5" /></div>
                  <StatusBadge status={society.status === "ACTIVE" ? "Active" : society.status} />
                </div>
                <h2 className="mt-4 font-semibold text-[var(--color-text)]">{society.society_name}</h2>
                <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">{society.society_code}</p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {[society.city, society.state].filter(Boolean).join(", ") || "Location not added"}</span>
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {society.memberCount ?? 0} assigned users</span>
                </div>
                <Button variant="outline" className="mt-5 w-full" onClick={() => router.push(`/select-society?society=${society.id}`)}>Select Society</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Add New Society"
        description="Basic society information is required before users and modules can be configured."
        size="lg"
      >
        <form id="create-society-form" onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <Input label="Society Code" required value={form.society_code} onChange={(e) => updateField("society_code", e.target.value)} placeholder="SOC001" />
          <Input label="Society Name" required value={form.society_name} onChange={(e) => updateField("society_name", e.target.value)} placeholder="Green Valley Society" />
          <Input label="Registration Number" value={form.registration_no} onChange={(e) => updateField("registration_no", e.target.value)} />
          <Input label="Registration Type" value={form.registration_type} onChange={(e) => updateField("registration_type", e.target.value)} />
          <Textarea wrapperClassName="sm:col-span-2" label="Address" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
          <Input label="City" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
          <Input label="State" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
          <Input label="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, ""))} />
          <Input label="PAN Number" value={form.pan_number} onChange={(e) => updateField("pan_number", e.target.value.toUpperCase())} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          <Input label="Mobile" inputMode="tel" value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
          <Input label="Established Date" type="date" value={form.established_date} onChange={(e) => updateField("established_date", e.target.value)} />
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Society</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
