"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { getSocietySession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type Wing = { id?: number; wing_code: string; wing_name: string };
type Building = {
  id: number; building_code: string; building_name: string; floors_per_wing: number;
  flats_per_floor: number; total_floors: number; total_flats: number;
  status: string; wings: Wing[];
};
type BuildingForm = {
  building_code: string; building_name: string; wing_names: string;
  floors_per_wing: string; flats_per_floor: string;
};

const EMPTY_FORM: BuildingForm = {
  building_code: "", building_name: "", wing_names: "",
  floors_per_wing: "", flats_per_floor: "",
};

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [form, setForm] = useState<BuildingForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<Building | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBuildings = useCallback(async () => {
    const session = getSocietySession();
    if (!session?.accessToken || !session.activeSociety) {
      setError("Please select a society before managing buildings.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/society/buildings`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to load buildings.");
      setBuildings(result.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load buildings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadBuildings(); }, [loadBuildings]);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setError(""); setSuccess(""); setDrawerOpen(true);
  };
  const openEdit = (building: Building) => {
    setEditing(building);
    setForm({
      building_code: building.building_code,
      building_name: building.building_name,
      wing_names: building.wings.map((wing) => wing.wing_name).join(", "),
      floors_per_wing: String(building.floors_per_wing),
      flats_per_floor: String(building.flats_per_floor),
    });
    setError(""); setSuccess(""); setDrawerOpen(true);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    const wingNames = form.wing_names.split(",").map((name) => name.trim()).filter(Boolean);
    if (!wingNames.length) return setError("Add at least one wing, for example: A, B");

    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`${API_URL}/society/buildings${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({
          building_code: form.building_code,
          building_name: form.building_name,
          floors_per_wing: Number(form.floors_per_wing),
          flats_per_floor: Number(form.flats_per_floor),
          wings: wingNames.map((name) => ({
            wing_code: name.toUpperCase().replace(/\s+/g, "-"), wing_name: name,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const validationMessage = Array.isArray(result.errors) ? result.errors.join(", ") : "";
        throw new Error(validationMessage || result.message || "Unable to save building.");
      }
      setDrawerOpen(false); setEditing(null); setForm(EMPTY_FORM);
      setSuccess(editing ? "Building updated successfully." : "Building created successfully.");
      await loadBuildings();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save building.");
    } finally { setSaving(false); }
  }

  async function handleDelete(building: Building) {
    if (!window.confirm(`Delete ${building.building_name} and its wings?`)) return;
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    setDeletingId(building.id); setError(""); setSuccess("");
    try {
      const response = await fetch(`${API_URL}/society/buildings/${building.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to delete building.");
      setSuccess("Building deleted successfully.");
      await loadBuildings();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete building.");
    } finally { setDeletingId(null); }
  }

  const columns: Column<Building>[] = [
    { key: "building_name", header: "Building", render: (building) => <span className="flex items-center gap-2 font-medium"><Building2 className="h-4 w-4 text-[var(--color-text-muted)]" />{building.building_name}<span className="text-xs text-[var(--color-text-muted)]">({building.building_code})</span></span> },
    { key: "wings", header: "Wings", render: (building) => building.wings.map((wing) => wing.wing_name).join(", ") },
    { key: "floors_per_wing", header: "Floors / Wing" },
    { key: "flats_per_floor", header: "Flats / Floor" },
    { key: "total_flats", header: "Expected Flats" },
    { key: "status", header: "Status", render: (building) => <StatusBadge status={building.status === "ACTIVE" ? "Active" : "Inactive"} /> },
  ];

  return (
    <div>
      <PageHeader title="Buildings / Wings" description="Manage the building and wing structure of the selected society." actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Building</Button>} />
      {error && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">{error}</p>}
      {success && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{success}</p>}
      <Card>
        <DataTable columns={columns} data={buildings} keyField="id" searchFields={["building_name", "building_code"]} searchPlaceholder={loading ? "Loading buildings..." : "Search buildings..."} rowActions={[
          { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: openEdit },
          { label: deletingId ? "Deleting..." : "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: (building) => void handleDelete(building), danger: true },
        ]} />
      </Card>

      <Drawer open={drawerOpen} onClose={() => !saving && setDrawerOpen(false)} title={editing ? "Edit Building / Wings" : "Add Building / Wings"} description="Wings must be unique within this building." footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" form="building-form" loading={saving}>{editing ? "Update Building" : "Save Building"}</Button></>}>
        <form id="building-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Building Code" required placeholder="e.g. BLD-A" value={form.building_code} onChange={(e) => setForm((current) => ({ ...current, building_code: e.target.value.toUpperCase() }))} />
          <Input label="Building Name" required placeholder="e.g. Sunrise Tower" value={form.building_name} onChange={(e) => setForm((current) => ({ ...current, building_name: e.target.value }))} />
          <Input label="Wings" required placeholder="e.g. A, B, C" helpText="Enter wing names separated by commas." value={form.wing_names} onChange={(e) => setForm((current) => ({ ...current, wing_names: e.target.value }))} />
          <Input label="Floors per Wing" type="number" min={1} max={200} required value={form.floors_per_wing} onChange={(e) => setForm((current) => ({ ...current, floors_per_wing: e.target.value }))} />
          <Input label="Flats per Floor" type="number" min={1} max={100} required value={form.flats_per_floor} onChange={(e) => setForm((current) => ({ ...current, flats_per_floor: e.target.value }))} />
          {form.wing_names && form.floors_per_wing && form.flats_per_floor && <p className="rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">Expected flats: {form.wing_names.split(",").filter((name) => name.trim()).length * Number(form.floors_per_wing) * Number(form.flats_per_floor)}</p>}
        </form>
      </Drawer>
    </div>
  );
}
