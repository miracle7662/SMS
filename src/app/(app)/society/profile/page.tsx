"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, Home, Landmark, Mail, MapPin, Phone, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { getSocietySession, saveActiveSociety } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type SocietyProfile = {
  id: number; society_code: string; society_name: string; registration_no: string;
  registration_type: string; address: string; city: string; state: string;
  pincode: string; pan_number: string; email: string; mobile: string; logo: string;
  established_date: string; buildings: number; flats: number; total_members: number; status: string;
};

const EMPTY_PROFILE: SocietyProfile = {
  id: 0, society_code: "", society_name: "", registration_no: "",
  registration_type: "Co-operative Housing Society", address: "", city: "",
  state: "Maharashtra", pincode: "", pan_number: "", email: "", mobile: "",
  logo: "", established_date: "", buildings: 0, flats: 0, total_members: 0, status: "ACTIVE",
};

const normalizeProfile = (profile: Partial<SocietyProfile>): SocietyProfile => ({
  ...EMPTY_PROFILE,
  ...profile,
  established_date: profile.established_date ? String(profile.established_date).slice(0, 10) : "",
});

export default function SocietyProfilePage() {
  const [profile, setProfile] = useState<SocietyProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const session = getSocietySession();
      if (!session?.accessToken || !session.activeSociety) {
        setError("Please select a society before opening its profile.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/society/profile`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Unable to load society profile.");
        setProfile(normalizeProfile(result.data));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load society profile.");
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, []);

  const updateField = (field: keyof SocietyProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSocietySession();
    if (!session?.accessToken || !session.activeSociety) {
      setError("Your active society session is missing. Please select the society again.");
      return;
    }

    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`${API_URL}/society/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({
          society_name: profile.society_name, registration_no: profile.registration_no,
          registration_type: profile.registration_type, address: profile.address,
          city: profile.city, state: profile.state, pincode: profile.pincode,
          pan_number: profile.pan_number, email: profile.email, mobile: profile.mobile,
          logo: profile.logo, established_date: profile.established_date,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const validationMessage = Array.isArray(result.errors) ? result.errors.join(", ") : "";
        throw new Error(validationMessage || result.message || "Unable to update society profile.");
      }

      const nextProfile = normalizeProfile(result.data);
      setProfile(nextProfile);
      let activeRoles: string[] = [];
      try { activeRoles = JSON.parse(session.storage.getItem("society_active_roles") || "[]"); } catch { activeRoles = []; }
      saveActiveSociety(session.storage, {
        ...session.activeSociety, id: nextProfile.id, code: nextProfile.society_code,
        name: nextProfile.society_name, logo: nextProfile.logo || null,
      }, session.accessToken, activeRoles);
      setSuccess("Society profile updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update society profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card><CardBody className="py-16 text-center text-sm text-[var(--color-text-secondary)]">Loading society profile...</CardBody></Card>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader title="Society Profile" description={`Manage registration and contact details for ${profile.society_name || "the selected society"}.`} actions={<Button type="submit" loading={saving}>Save Changes</Button>} />
      {error && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">{error}</p>}
      {success && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{success}</p>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Basic Information" description="Society code is permanent; all other details can be updated." />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Society Code" value={profile.society_code} disabled />
            <Input label="Society Name" required value={profile.society_name} onChange={(e) => updateField("society_name", e.target.value)} />
            <Input label="Registration Number" value={profile.registration_no} onChange={(e) => updateField("registration_no", e.target.value)} />
            <Select label="Registration Type" options={[
              { label: "Co-operative Housing Society", value: "Co-operative Housing Society" },
              { label: "Apartment Owners Association", value: "Apartment Owners Association" },
              { label: "Residential Welfare Association", value: "Residential Welfare Association" },
            ]} value={profile.registration_type} onChange={(e) => updateField("registration_type", e.target.value)} />
            <Textarea label="Registered Address" value={profile.address} onChange={(e) => updateField("address", e.target.value)} wrapperClassName="sm:col-span-2" />
            <Input label="City" value={profile.city} onChange={(e) => updateField("city", e.target.value)} />
            <Input label="State" value={profile.state} onChange={(e) => updateField("state", e.target.value)} />
            <Input label="Pincode" inputMode="numeric" maxLength={6} value={profile.pincode} onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, ""))} />
            <Input label="PAN Number" value={profile.pan_number} onChange={(e) => updateField("pan_number", e.target.value.toUpperCase())} />
            <Input label="Contact Number" inputMode="tel" icon={<Phone className="h-4 w-4" />} value={profile.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
            <Input label="Email Address" type="email" icon={<Mail className="h-4 w-4" />} value={profile.email} onChange={(e) => updateField("email", e.target.value)} />
            <Input label="Established Date" type="date" value={profile.established_date} onChange={(e) => updateField("established_date", e.target.value)} />
            <Input label="Logo URL" type="url" value={profile.logo} onChange={(e) => updateField("logo", e.target.value)} helpText="Image upload will be added with the Documents module." />
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader title="At a Glance" />
          <CardBody className="flex flex-col gap-4">
            {profile.logo ? <img src={profile.logo} alt={`${profile.society_name} logo`} className="mx-auto h-24 w-24 rounded-[var(--radius-lg)] border border-[var(--color-border)] object-cover" /> : <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><Building2 className="h-9 w-9" /></div>}
            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-[var(--color-text-muted)]" /><span className="text-sm text-[var(--color-text-secondary)]">{profile.buildings} Buildings</span></div>
            <div className="flex items-center gap-3"><Home className="h-4 w-4 text-[var(--color-text-muted)]" /><span className="text-sm text-[var(--color-text-secondary)]">{profile.flats} Flats</span></div>
            <div className="flex items-center gap-3"><Users className="h-4 w-4 text-[var(--color-text-muted)]" /><span className="text-sm text-[var(--color-text-secondary)]">{profile.total_members} Members</span></div>
            <div className="flex items-center gap-3"><Landmark className="h-4 w-4 text-[var(--color-text-muted)]" /><span className="text-sm text-[var(--color-text-secondary)]">{profile.established_date ? `Established ${profile.established_date.slice(0, 4)}` : "Established date not added"}</span></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[var(--color-text-muted)]" /><span className="text-sm text-[var(--color-text-secondary)]">{[profile.city, profile.state].filter(Boolean).join(", ") || "Location not added"}</span></div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Buildings Overview" description="Buildings created for this selected society will appear here." />
        <CardBody className="text-sm text-[var(--color-text-secondary)]">Building management will be connected in the next Society Setup step.</CardBody>
      </Card>
    </form>
  );
}
