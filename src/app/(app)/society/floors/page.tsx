"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { getSocietySession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type Wing = { id: number; wing_code: string; wing_name: string };
type Building = { id: number; building_code: string; building_name: string; floors_per_wing: number; wings: Wing[] };
type Floor = {
  id: number; building_id: number; wing_id: number; building_name: string; building_code: string;
  wing_name: string; wing_code: string; floor_number: number; floor_name: string;
  flats_per_floor: number; status: string;
};

export default function FloorsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Floor | null>(null);
  const [buildingId, setBuildingId] = useState("");
  const [wingId, setWingId] = useState("");
  const [startFloor, setStartFloor] = useState("1");
  const [numberOfFloors, setNumberOfFloors] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [floorName, setFloorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchApi = useCallback(async (path: string) => {
    const session = getSocietySession();
    if (!session?.accessToken || !session.activeSociety) throw new Error("Please select a society first.");
    const response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Unable to load data.");
    return result.data;
  }, []);

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [buildingData, floorData] = await Promise.all([
        fetchApi("/society/buildings"), fetchApi("/society/floors"),
      ]);
      setBuildings(buildingData ?? []); setFloors(floorData ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load floors.");
    } finally { setLoading(false); }
  }, [fetchApi]);

  useEffect(() => { void loadData(); }, [loadData]);

  const selectedBuilding = buildings.find((building) => String(building.id) === buildingId);
  const availableWings = selectedBuilding?.wings ?? [];

  const openGenerate = () => {
    setEditing(null); setBuildingId(""); setWingId(""); setStartFloor("1"); setNumberOfFloors("");
    setError(""); setSuccess(""); setDrawerOpen(true);
  };
  const openEdit = (floor: Floor) => {
    setEditing(floor); setFloorNumber(String(floor.floor_number)); setFloorName(floor.floor_name);
    setError(""); setSuccess(""); setDrawerOpen(true);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    setSaving(true); setError(""); setSuccess("");
    try {
      const path = editing ? `/society/floors/${editing.id}` : "/society/floors/generate";
      const response = await fetch(`${API_URL}${path}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify(editing ? {
          floor_number: Number(floorNumber), floor_name: floorName,
        } : {
          building_id: Number(buildingId), wing_id: Number(wingId),
          start_floor: Number(startFloor), number_of_floors: Number(numberOfFloors),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const validationMessage = Array.isArray(result.errors) ? result.errors.join(", ") : "";
        throw new Error(validationMessage || result.message || "Unable to save floors.");
      }
      setDrawerOpen(false); setEditing(null);
      setSuccess(editing ? "Floor updated successfully." : `${result.data?.generated_count ?? numberOfFloors} floors generated successfully.`);
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save floors.");
    } finally { setSaving(false); }
  }

  async function handleDelete(floor: Floor) {
    if (!window.confirm(`Delete ${floor.floor_name} from ${floor.building_name} - ${floor.wing_name}?`)) return;
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    try {
      const response = await fetch(`${API_URL}/society/floors/${floor.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to delete floor.");
      setSuccess("Floor deleted successfully."); setError(""); await loadData();
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Unable to delete floor."); }
  }

  const columns: Column<Floor>[] = [
    { key: "building_name", header: "Building", render: (floor) => <span className="flex items-center gap-2 font-medium"><Layers className="h-4 w-4 text-[var(--color-text-muted)]" />{floor.building_name}</span> },
    { key: "wing_name", header: "Wing" },
    { key: "floor_number", header: "Floor No." },
    { key: "floor_name", header: "Floor Name" },
    { key: "flats_per_floor", header: "Planned Flats" },
    { key: "status", header: "Status", render: (floor) => <StatusBadge status={floor.status === "ACTIVE" ? "Active" : "Inactive"} /> },
  ];

  return (
    <div>
      <PageHeader title="Floors" description="Generate and manage floors for each building wing." actions={<Button onClick={openGenerate}><Plus className="h-4 w-4" /> Generate Floors</Button>} />
      {error && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">{error}</p>}
      {success && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{success}</p>}
      <Card>
        <DataTable columns={columns} data={floors} keyField="id" searchFields={["building_name", "wing_name", "floor_name"]} searchPlaceholder={loading ? "Loading floors..." : "Search floors..."} filters={buildings.length ? [{ key: "building_name", label: "Building", options: buildings.map((building) => building.building_name) }] : undefined} rowActions={[
          { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: openEdit },
          { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: (floor) => void handleDelete(floor), danger: true },
        ]} />
      </Card>

      <Drawer open={drawerOpen} onClose={() => !saving && setDrawerOpen(false)} title={editing ? "Edit Floor" : "Generate Floors"} description={editing ? "Update this floor's number and display name." : "Select a building and wing, then generate floors in one action."} footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" form="floor-form" loading={saving}>{editing ? "Update Floor" : "Generate Floors"}</Button></>}>
        <form id="floor-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {editing ? <>
            <Input label="Building / Wing" value={`${editing.building_name} / ${editing.wing_name}`} disabled />
            <Input label="Floor Number" type="number" min={-10} max={200} required value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} />
            <Input label="Floor Name" required value={floorName} onChange={(e) => setFloorName(e.target.value)} />
          </> : <>
            <Select label="Building" required placeholder="Select building" options={buildings.map((building) => ({ label: `${building.building_name} (${building.building_code})`, value: String(building.id) }))} value={buildingId} onChange={(e) => { const next = e.target.value; setBuildingId(next); setWingId(""); const building = buildings.find((item) => String(item.id) === next); setNumberOfFloors(building ? String(building.floors_per_wing) : ""); }} />
            <Select label="Wing" required placeholder="Select wing" options={availableWings.map((wing) => ({ label: wing.wing_name, value: String(wing.id) }))} value={wingId} onChange={(e) => setWingId(e.target.value)} disabled={!buildingId} />
            <Input label="Start Floor" type="number" min={-10} max={200} required value={startFloor} onChange={(e) => setStartFloor(e.target.value)} helpText="Use 0 for Ground Floor and -1 for Basement 1." />
            <Input label="Number of Floors" type="number" min={1} max={200} required value={numberOfFloors} onChange={(e) => setNumberOfFloors(e.target.value)} />
            {wingId && numberOfFloors && <p className="rounded-[var(--radius-md)] bg-[var(--color-bg)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">Floors {startFloor} through {Number(startFloor) + Number(numberOfFloors) - 1} will be generated for the selected wing.</p>}
          </>}
        </form>
      </Drawer>
    </div>
  );
}
