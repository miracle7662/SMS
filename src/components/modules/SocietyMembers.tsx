"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Eye, Pencil, FileText } from "lucide-react";
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
type MemberRow = { 
  id: number; member_code: string; name: string; mobile: string; email: string | null; 
  flat_id: number; flat_no: string; building_name: string; wing_name: string; 
  member_type: MemberType; ownership_percentage: number | null; 
  occupancy_start: string | null; occupancy_end: string | null; 
  agreement_status: string; police_noc_status: string; is_primary: boolean; 
  status: "ACTIVE" | "INACTIVE";
  father_husband_name?: string;
  date_of_birth?: string;
  gender?: string;
  alternate_mobile?: string;
  pan_number?: string;
  aadhaar_number?: string;
  occupation?: string;
  profile_photo?: string;
  address_line?: string;
  area_locality?: string;
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
};
const labels: Record<MemberType, string> = { OWNER: "Owner", CO_OWNER: "Co-Owner", TENANT: "Tenant" };

export function SocietyMembers({ type, title = "All Members" }: { type?: MemberType; title?: string }) {
  const [rows, setRows] = useState<MemberRow[]>([]); 
  const [flats, setFlats] = useState<FlatOption[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); 
  const [success, setSuccess] = useState("");
  
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [docDrawerOpen, setDocDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    email: "",
    flat_id: "",
    member_type: "OWNER" as MemberType,
    ownership_percentage: "100",
    occupancy_start: "",
    occupancy_end: "",
    agreement_status: "NOT_REQUIRED",
    police_noc_status: "NOT_REQUIRED",
    is_primary: false,
    father_husband_name: "",
    date_of_birth: "",
    gender: "",
    alternate_mobile: "",
    pan_number: "",
    aadhaar_number: "",
    occupation: "",
    profile_photo: "",
    address_line: "",
    area_locality: "",
    city: "",
    state: "",
    country: "India",
    pin_code: ""
  });
  
  const [form, setForm] = useState({
    name: "", 
    mobile: "", 
    email: "", 
    flat_id: "", 
    member_type: type ?? "OWNER" as MemberType, 
    ownership_percentage: "100", 
    occupancy_start: "", 
    occupancy_end: "", 
    agreement_status: "NOT_REQUIRED", 
    police_noc_status: "NOT_REQUIRED", 
    is_primary: true,
    father_husband_name: "",
    date_of_birth: "",
    gender: "",
    alternate_mobile: "",
    pan_number: "",
    aadhaar_number: "",
    occupation: "",
    profile_photo: "",
    address_line: "",
    area_locality: "",
    city: "",
    state: "",
    country: "India",
    pin_code: ""
  });

  const loadData = useCallback(async () => {
    const session = getSocietySession();
    if (!session?.accessToken || !session.activeSociety) { 
      setError("Please select a society first."); 
      setLoading(false); 
      return; 
    }
    try {
      const headers = { Authorization: `Bearer ${session.accessToken}` }; 
      const query = type ? `?type=${type}` : "";
      const [membersResponse, flatsResponse] = await Promise.all([
        fetch(`${API_URL}/society/members${query}`, { headers }), 
        fetch(`${API_URL}/society/flats`, { headers })
      ]);
      const [membersResult, flatsResult] = await Promise.all([
        membersResponse.json(), 
        flatsResponse.json()
      ]);
      if (!membersResponse.ok || !membersResult.success) 
        throw new Error(membersResult.message || "Unable to load members.");
      if (!flatsResponse.ok || !flatsResult.success) 
        throw new Error(flatsResult.message || "Unable to load flats.");
      setRows(membersResult.data ?? []); 
      setFlats(flatsResult.data ?? []);
    } catch (loadError) { 
      setError(loadError instanceof Error ? loadError.message : "Unable to load members."); 
    } finally { 
      setLoading(false); 
    }
  }, [type]);

  useEffect(() => { 
    void loadData(); 
  }, [loadData]);

  const openCreate = () => { 
    const memberType = type ?? "OWNER"; 
    setForm({ 
      name: "", 
      mobile: "", 
      email: "", 
      flat_id: "", 
      member_type: memberType, 
      ownership_percentage: memberType === "TENANT" ? "" : "100", 
      occupancy_start: "", 
      occupancy_end: "", 
      agreement_status: memberType === "TENANT" ? "PENDING" : "NOT_REQUIRED", 
      police_noc_status: memberType === "TENANT" ? "PENDING" : "NOT_REQUIRED", 
      is_primary: memberType === "OWNER",
      father_husband_name: "",
      date_of_birth: "",
      gender: "",
      alternate_mobile: "",
      pan_number: "",
      aadhaar_number: "",
      occupation: "",
      profile_photo: "",
      address_line: "",
      area_locality: "",
      city: "",
      state: "",
      country: "India",
      pin_code: ""
    }); 
    setError(""); 
    setSuccess(""); 
    setDrawerOpen(true); 
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        flat_id: Number(form.flat_id),
        member_type: form.member_type,
        ownership_percentage: form.ownership_percentage ? Number(form.ownership_percentage) : null,
        occupancy_start: form.occupancy_start || null,
        occupancy_end: form.occupancy_end || null,
        agreement_status: form.agreement_status,
        police_noc_status: form.police_noc_status,
        is_primary: form.is_primary,
        father_husband_name: form.father_husband_name || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        alternate_mobile: form.alternate_mobile || null,
        pan_number: form.pan_number || null,
        aadhaar_number: form.aadhaar_number || null,
        occupation: form.occupation || null,
        profile_photo: form.profile_photo || null,
        address_line: form.address_line || null,
        area_locality: form.area_locality || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || 'India',
        pin_code: form.pin_code || null
      };

      console.log("📤 Sending payload:", payload);

      const response = await fetch(`${API_URL}/society/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(Array.isArray(result.errors) ? result.errors.join(", ") : result.message || "Unable to add member.");
      }
      
      setDrawerOpen(false);
      setSuccess(`${labels[form.member_type]} added successfully.`);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to add member.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: MemberRow) {
    if (!window.confirm(`Remove ${row.name}'s ${labels[row.member_type]} assignment from flat ${row.flat_no}?`)) return;
    const session = getSocietySession(); 
    if (!session?.accessToken) return setError("Your session is missing.");
    try { 
      const response = await fetch(`${API_URL}/society/members/${row.id}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${session.accessToken}` } 
      }); 
      const result = await response.json(); 
      if (!response.ok || !result.success) 
        throw new Error(result.message || "Unable to remove member."); 
      setSuccess("Member removed successfully."); 
      await loadData(); 
    } catch (removeError) { 
      setError(removeError instanceof Error ? removeError.message : "Unable to remove member."); 
    }
  }

  function viewDetails(row: MemberRow) {
    setSelectedMember(row);
    setViewDrawerOpen(true);
  }

  function editMember(row: MemberRow) {
    setSelectedMember(row);
    setEditForm({
      name: row.name || "",
      mobile: row.mobile || "",
      email: row.email || "",
      flat_id: String(row.flat_id || ""),
      member_type: row.member_type || "OWNER",
      ownership_percentage: String(row.ownership_percentage || "100"),
      occupancy_start: row.occupancy_start || "",
      occupancy_end: row.occupancy_end || "",
      agreement_status: row.agreement_status || "NOT_REQUIRED",
      police_noc_status: row.police_noc_status || "NOT_REQUIRED",
      is_primary: row.is_primary || false,
      father_husband_name: row.father_husband_name || "",
      date_of_birth: row.date_of_birth || "",
      gender: row.gender || "",
      alternate_mobile: row.alternate_mobile || "",
      pan_number: row.pan_number || "",
      aadhaar_number: row.aadhaar_number || "",
      occupation: row.occupation || "",
      profile_photo: row.profile_photo || "",
      address_line: row.address_line || "",
      area_locality: row.area_locality || "",
      city: row.city || "",
      state: row.state || "",
      country: row.country || "India",
      pin_code: row.pin_code || ""
    });
    setEditDrawerOpen(true);
  }

  function viewDocuments(row: MemberRow) {
    setSelectedMember(row);
    setDocDrawerOpen(true);
  }

  async function updateMember(event: FormEvent) {
    event.preventDefault();
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    if (!selectedMember) return;
    
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: editForm.name,
        mobile: editForm.mobile,
        email: editForm.email,
        flat_id: Number(editForm.flat_id),
        member_type: editForm.member_type,
        ownership_percentage: editForm.ownership_percentage ? Number(editForm.ownership_percentage) : null,
        occupancy_start: editForm.occupancy_start || null,
        occupancy_end: editForm.occupancy_end || null,
        agreement_status: editForm.agreement_status,
        police_noc_status: editForm.police_noc_status,
        is_primary: editForm.is_primary,
        father_husband_name: editForm.father_husband_name || null,
        date_of_birth: editForm.date_of_birth || null,
        gender: editForm.gender || null,
        alternate_mobile: editForm.alternate_mobile || null,
        pan_number: editForm.pan_number || null,
        aadhaar_number: editForm.aadhaar_number || null,
        occupation: editForm.occupation || null,
        profile_photo: editForm.profile_photo || null,
        address_line: editForm.address_line || null,
        area_locality: editForm.area_locality || null,
        city: editForm.city || null,
        state: editForm.state || null,
        country: editForm.country || 'India',
        pin_code: editForm.pin_code || null
      };

      const response = await fetch(`${API_URL}/society/members/${selectedMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update member.");
      }
      
      setEditDrawerOpen(false);
      setSuccess("Member updated successfully.");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update member.");
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<MemberRow>[] = [
    { key: "name", header: "Member", render: (row) => (
      <span className="flex items-center gap-2.5">
        {row.profile_photo ? (
          <img src={row.profile_photo} alt={row.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-semibold text-[var(--color-primary)]">
            {initials(row.name)}
          </span>
        )}
        <span>
          <span className="block font-medium">{row.name}</span>
          <span className="block text-xs text-[var(--color-text-secondary)]">{row.member_code}</span>
        </span>
      </span>
    )},
    { key: "flat_no", header: "Flat", render: (row) => {
      const wing = row.wing_name || '';
      const flat = row.flat_no || '';
      return wing ? `${wing}-${flat}` : flat || 'N/A';
    }},
    { key: "building_name", header: "Building" }, 
    { key: "mobile", header: "Mobile" },
    { key: "member_type", header: "Type", render: (row) => <Badge>{labels[row.member_type]}</Badge> }, 
    { key: "ownership_percentage", header: "Ownership", render: (row) => row.ownership_percentage ? `${row.ownership_percentage}%` : "—" },
    { key: "occupancy_start", header: "Start Date", render: (row) => 
      row.occupancy_start ? formatDate(row.occupancy_start) : "—" 
    },
    { key: "occupancy_end", header: "End Date", render: (row) => 
      row.occupancy_end ? formatDate(row.occupancy_end) : "—" 
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status === "ACTIVE" ? "Active" : "Inactive"} /> },
    { key: "actions", header: "Actions", render: (row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => viewDetails(row)} title="View Details">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editMember(row)} title="Edit Member">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => viewDocuments(row)} title="Documents">
          <FileText className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => remove(row)} title="Remove" className="text-red-500 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )}
  ];

  const isTenant = form.member_type === "TENANT";

  return (
    <div>
      <PageHeader 
        title={title} 
        description={`${rows.length} members in the selected society`} 
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add {type ? labels[type] : "Member"}
          </Button>
        } 
      />
      
      {error && (
        <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">
          {success}
        </p>
      )}
      
      <Card>
        <DataTable 
          columns={columns} 
          data={rows} 
          keyField="id" 
          searchFields={["name", "mobile", "flat_no", "building_name"]} 
          searchPlaceholder={loading ? "Loading members..." : "Search members..."} 
          filters={!type ? [{ key: "member_type", label: "Member Type", options: ["OWNER","CO_OWNER","TENANT"] }] : undefined} 
        />
      </Card>

      {/* ===== ADD MEMBER DRAWER ===== */}
      <Drawer 
        open={drawerOpen} 
        onClose={() => !saving && setDrawerOpen(false)} 
        title={`Add ${type ? labels[type] : "Member"}`} 
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="member-form" loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <form id="member-form" onSubmit={submit} className="flex flex-col gap-4">
          
          <div className="border-b pb-4">
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Personal Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input 
                label="Full Name" 
                required 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="col-span-2"
              />
              <Input 
                label="Father / Husband Name" 
                value={form.father_husband_name} 
                onChange={(e) => setForm({ ...form, father_husband_name: e.target.value })} 
              />
              <Input 
                label="Date of Birth" 
                type="date" 
                value={form.date_of_birth} 
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} 
              />
              <Select 
                label="Gender" 
                value={form.gender} 
                onChange={(e) => setForm({ ...form, gender: e.target.value })} 
                placeholder="Select gender"
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" }
                ]}
              />
              <Input 
                label="Mobile Number" 
                required 
                inputMode="tel" 
                value={form.mobile} 
                onChange={(e) => setForm({ ...form, mobile: e.target.value })} 
              />
              <Input 
                label="Alternate Mobile" 
                inputMode="tel" 
                value={form.alternate_mobile} 
                onChange={(e) => setForm({ ...form, alternate_mobile: e.target.value })} 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="col-span-2"
              />
              <Input 
                label="PAN Number" 
                placeholder="ABCDE1234F" 
                value={form.pan_number} 
                onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })} 
              />
              <Input 
                label="Aadhaar Number" 
                placeholder="123456789012" 
                maxLength={12}
                value={form.aadhaar_number} 
                onChange={(e) => setForm({ ...form, aadhaar_number: e.target.value.replace(/\D/g, '') })} 
              />
              <Input 
                label="Occupation" 
                value={form.occupation} 
                onChange={(e) => setForm({ ...form, occupation: e.target.value })} 
                className="col-span-2"
              />
              <Input 
                label="Profile Photo URL" 
                placeholder="https://example.com/photo.jpg" 
                value={form.profile_photo} 
                onChange={(e) => setForm({ ...form, profile_photo: e.target.value })} 
                className="col-span-2"
              />
            </div>
          </div>

          <div className="border-b pb-4">
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Address Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input 
                label="Address" 
                placeholder="House No, Building Name, Street" 
                value={form.address_line} 
                onChange={(e) => setForm({ ...form, address_line: e.target.value })} 
                className="col-span-2"
              />
              <Input 
                label="Area / Locality" 
                placeholder="Area, Locality, Sector" 
                value={form.area_locality} 
                onChange={(e) => setForm({ ...form, area_locality: e.target.value })} 
              />
              <Input 
                label="City" 
                placeholder="Mumbai, Pune, etc." 
                value={form.city} 
                onChange={(e) => setForm({ ...form, city: e.target.value })} 
              />
              <Input 
                label="State" 
                placeholder="Maharashtra" 
                value={form.state} 
                onChange={(e) => setForm({ ...form, state: e.target.value })} 
              />
              <Input 
                label="Country" 
                placeholder="India" 
                value={form.country} 
                onChange={(e) => setForm({ ...form, country: e.target.value })} 
              />
              <Input 
                label="PIN Code" 
                placeholder="400001" 
                maxLength={10}
                value={form.pin_code} 
                onChange={(e) => setForm({ ...form, pin_code: e.target.value.replace(/\D/g, '') })} 
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Flat & Ownership</h4>
            <div className="grid grid-cols-2 gap-3">
              <Select 
                label="Flat" 
                required 
                value={form.flat_id} 
                onChange={(e) => setForm({ ...form, flat_id: e.target.value })} 
                placeholder="Select flat" 
                options={flats.map((flat) => ({ 
                  value: String(flat.id), 
                  label: `${flat.building_name} / ${flat.wing_name} / ${flat.flat_no}` 
                }))} 
                className="col-span-2"
              />
              {!type && (
                <Select 
                  label="Member Type" 
                  required 
                  value={form.member_type} 
                  onChange={(e) => { 
                    const member_type = e.target.value as MemberType; 
                    setForm({ 
                      ...form, 
                      member_type, 
                      ownership_percentage: member_type === "TENANT" ? "" : "100", 
                      agreement_status: member_type === "TENANT" ? "PENDING" : "NOT_REQUIRED", 
                      police_noc_status: member_type === "TENANT" ? "PENDING" : "NOT_REQUIRED" 
                    }); 
                  }} 
                  options={Object.entries(labels).map(([value, label]) => ({ value, label }))} 
                />
              )}
              
              <Input 
                label="Agreement Start Date" 
                type="date" 
                value={form.occupancy_start} 
                onChange={(e) => setForm({ ...form, occupancy_start: e.target.value })} 
              />
              
              <Input 
                label="Agreement End Date" 
                type="date" 
                value={form.occupancy_end} 
                onChange={(e) => setForm({ ...form, occupancy_end: e.target.value })} 
              />
              
              {!isTenant && (
                <Input 
                  label="Ownership Percentage" 
                  type="number" 
                  min="0.01" 
                  max="100" 
                  step="0.01" 
                  value={form.ownership_percentage} 
                  onChange={(e) => setForm({ ...form, ownership_percentage: e.target.value })} 
                />
              )}
              {isTenant && (
                <>
                  <Select 
                    label="Agreement Status" 
                    value={form.agreement_status} 
                    onChange={(e) => setForm({ ...form, agreement_status: e.target.value })} 
                    options={["PENDING","VERIFIED","EXPIRED"].map((value) => ({ value, label: value }))} 
                  />
                  <Select 
                    label="Police NOC" 
                    value={form.police_noc_status} 
                    onChange={(e) => setForm({ ...form, police_noc_status: e.target.value })} 
                    options={["PENDING","VERIFIED"].map((value) => ({ value, label: value }))} 
                  />
                </>
              )}
              <Checkbox 
                checked={form.is_primary} 
                onChange={(is_primary) => setForm({ ...form, is_primary })} 
                label="Primary member for this flat" 
                className="col-span-2"
              />
            </div>
          </div>

        </form>
      </Drawer>

      {/* ===== VIEW DETAILS DRAWER ===== */}
      <Drawer
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        title={`Member Details: ${selectedMember?.name || ''}`}
        footer={
          <Button variant="outline" onClick={() => setViewDrawerOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="p-4 space-y-4">
          <div className="flex justify-center mb-4">
            {selectedMember?.profile_photo ? (
              <img 
                src={selectedMember.profile_photo} 
                alt={selectedMember.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                <span className="text-2xl font-semibold text-gray-500">
                  {selectedMember?.name ? initials(selectedMember.name) : '?'}
                </span>
              </div>
            )}
          </div>

          <div className="text-center border-b pb-3">
            <p className="text-xs text-[var(--color-text-secondary)]">Member Code</p>
            <p className="font-mono font-medium">{selectedMember?.member_code || 'N/A'}</p>
          </div>
          
          <div className="border-b pb-3">
            <h4 className="text-sm font-semibold text-[var(--color-primary)] mb-2">Personal Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Full Name</p>
                <p className="font-medium">{selectedMember?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Father / Husband</p>
                <p className="font-medium">{selectedMember?.father_husband_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Date of Birth</p>
                <p className="font-medium">{selectedMember?.date_of_birth ? formatDate(selectedMember.date_of_birth) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Gender</p>
                <p className="font-medium">{selectedMember?.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Mobile</p>
                <p className="font-medium">{selectedMember?.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Alternate Mobile</p>
                <p className="font-medium">{selectedMember?.alternate_mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Email</p>
                <p className="font-medium">{selectedMember?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">PAN Number</p>
                <p className="font-medium">{selectedMember?.pan_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Aadhaar Number</p>
                <p className="font-medium">{selectedMember?.aadhaar_number || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[var(--color-text-secondary)] text-xs">Occupation</p>
                <p className="font-medium">{selectedMember?.occupation || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="border-b pb-3">
            <h4 className="text-sm font-semibold text-[var(--color-primary)] mb-2">Address Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="col-span-2">
                <p className="text-[var(--color-text-secondary)] text-xs">Address</p>
                <p className="font-medium">{selectedMember?.address_line || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Area / Locality</p>
                <p className="font-medium">{selectedMember?.area_locality || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">City</p>
                <p className="font-medium">{selectedMember?.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">State</p>
                <p className="font-medium">{selectedMember?.state || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Country</p>
                <p className="font-medium">{selectedMember?.country || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">PIN Code</p>
                <p className="font-medium">{selectedMember?.pin_code || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-primary)] mb-2">Flat & Ownership</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Flat</p>
                <p className="font-medium">{selectedMember?.flat_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Member Type</p>
                <p className="font-medium">{selectedMember?.member_type ? labels[selectedMember.member_type] : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Ownership %</p>
                <p className="font-medium">{selectedMember?.ownership_percentage || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Agreement Start</p>
                <p className="font-medium">{selectedMember?.occupancy_start ? formatDate(selectedMember.occupancy_start) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Agreement End</p>
                <p className="font-medium">{selectedMember?.occupancy_end ? formatDate(selectedMember.occupancy_end) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Primary Member</p>
                <p className="font-medium">{selectedMember?.is_primary ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs">Status</p>
                <p className="font-medium"><StatusBadge status={selectedMember?.status === "ACTIVE" ? "Active" : "Inactive"} /></p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* ===== EDIT MEMBER DRAWER ===== */}
      <Drawer
        open={editDrawerOpen}
        onClose={() => !saving && setEditDrawerOpen(false)}
        title={`Edit Member: ${selectedMember?.name || ''}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditDrawerOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="edit-member-form" loading={saving}>
              Update
            </Button>
          </>
        }
      >
        <form id="edit-member-form" onSubmit={updateMember} className="flex flex-col gap-4">
          
          <div className="border-b pb-4">
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Personal Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-2"
              />
              <Input
                label="Father / Husband Name"
                value={editForm.father_husband_name}
                onChange={(e) => setEditForm({ ...editForm, father_husband_name: e.target.value })}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
              />
              <Select
                label="Gender"
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                placeholder="Select gender"
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                  { value: "OTHER", label: "Other" }
                ]}
              />
              <Input
                label="Mobile Number"
                required
                inputMode="tel"
                value={editForm.mobile}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
              />
              <Input
                label="Alternate Mobile"
                inputMode="tel"
                value={editForm.alternate_mobile}
                onChange={(e) => setEditForm({ ...editForm, alternate_mobile: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="col-span-2"
              />
              <Input
                label="PAN Number"
                placeholder="ABCDE1234F"
                value={editForm.pan_number}
                onChange={(e) => setEditForm({ ...editForm, pan_number: e.target.value.toUpperCase() })}
              />
              <Input
                label="Aadhaar Number"
                placeholder="123456789012"
                maxLength={12}
                value={editForm.aadhaar_number}
                onChange={(e) => setEditForm({ ...editForm, aadhaar_number: e.target.value.replace(/\D/g, '') })}
              />
              <Input
                label="Occupation"
                value={editForm.occupation}
                onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                className="col-span-2"
              />
              <Input
                label="Profile Photo URL"
                placeholder="https://example.com/photo.jpg"
                value={editForm.profile_photo}
                onChange={(e) => setEditForm({ ...editForm, profile_photo: e.target.value })}
                className="col-span-2"
              />
            </div>
          </div>

          <div className="border-b pb-4">
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Address Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Address"
                placeholder="House No, Building Name, Street"
                value={editForm.address_line}
                onChange={(e) => setEditForm({ ...editForm, address_line: e.target.value })}
                className="col-span-2"
              />
              <Input
                label="Area / Locality"
                placeholder="Area, Locality, Sector"
                value={editForm.area_locality}
                onChange={(e) => setEditForm({ ...editForm, area_locality: e.target.value })}
              />
              <Input
                label="City"
                placeholder="Mumbai, Pune, etc."
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
              <Input
                label="State"
                placeholder="Maharashtra"
                value={editForm.state}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              />
              <Input
                label="Country"
                placeholder="India"
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              />
              <Input
                label="PIN Code"
                placeholder="400001"
                maxLength={10}
                value={editForm.pin_code}
                onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Flat & Ownership</h4>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Flat"
                required
                value={editForm.flat_id}
                onChange={(e) => setEditForm({ ...editForm, flat_id: e.target.value })}
                placeholder="Select flat"
                options={flats.map((flat) => ({
                  value: String(flat.id),
                  label: `${flat.building_name} / ${flat.wing_name} / ${flat.flat_no}`
                }))}
                className="col-span-2"
              />
              <Select
                label="Member Type"
                required
                value={editForm.member_type}
                onChange={(e) => {
                  const member_type = e.target.value as MemberType;
                  setEditForm({
                    ...editForm,
                    member_type,
                    ownership_percentage: member_type === "TENANT" ? "" : "100",
                    agreement_status: member_type === "TENANT" ? "PENDING" : "NOT_REQUIRED",
                    police_noc_status: member_type === "TENANT" ? "PENDING" : "NOT_REQUIRED"
                  });
                }}
                options={Object.entries(labels).map(([value, label]) => ({ value, label }))}
              />
              
              <Input
                label="Agreement Start Date"
                type="date"
                value={editForm.occupancy_start}
                onChange={(e) => setEditForm({ ...editForm, occupancy_start: e.target.value })}
              />
              
              <Input
                label="Agreement End Date"
                type="date"
                value={editForm.occupancy_end}
                onChange={(e) => setEditForm({ ...editForm, occupancy_end: e.target.value })}
              />
              
              {editForm.member_type !== "TENANT" && (
                <Input
                  label="Ownership Percentage"
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={editForm.ownership_percentage}
                  onChange={(e) => setEditForm({ ...editForm, ownership_percentage: e.target.value })}
                />
              )}
              {editForm.member_type === "TENANT" && (
                <>
                  <Select
                    label="Agreement Status"
                    value={editForm.agreement_status}
                    onChange={(e) => setEditForm({ ...editForm, agreement_status: e.target.value })}
                    options={["PENDING","VERIFIED","EXPIRED"].map((value) => ({ value, label: value }))}
                  />
                  <Select
                    label="Police NOC"
                    value={editForm.police_noc_status}
                    onChange={(e) => setEditForm({ ...editForm, police_noc_status: e.target.value })}
                    options={["PENDING","VERIFIED"].map((value) => ({ value, label: value }))}
                  />
                </>
              )}
              <Checkbox
                checked={editForm.is_primary}
                onChange={(is_primary) => setEditForm({ ...editForm, is_primary })}
                label="Primary member for this flat"
                className="col-span-2"
              />
            </div>
          </div>

        </form>
      </Drawer>

      {/* ===== DOCUMENTS DRAWER ===== */}
      <Drawer
        open={docDrawerOpen}
        onClose={() => setDocDrawerOpen(false)}
        title={`Documents: ${selectedMember?.name || ''}`}
        footer={
          <Button variant="outline" onClick={() => setDocDrawerOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="p-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Manage documents for {selectedMember?.name}
          </p>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Aadhaar Card</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Status: Not uploaded</p>
              </div>
              <Button variant="outline" size="sm">Upload</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">PAN Card</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Status: Not uploaded</p>
              </div>
              <Button variant="outline" size="sm">Upload</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Profile Photo</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Status: Not uploaded</p>
              </div>
              <Button variant="outline" size="sm">Upload</Button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}