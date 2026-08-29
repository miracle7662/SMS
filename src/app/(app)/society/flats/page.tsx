"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Home, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { getSocietySession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
const FLAT_TYPES = ["1 RK", "1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "Shop", "Office"];

type Wing = { id: number; wing_code: string; wing_name: string };
type Building = { id: number; building_code: string; building_name: string; flats_per_floor: number; wings: Wing[] };
type Floor = { id: number; building_id: number; wing_id: number; floor_number: number; floor_name: string; building_name: string; wing_name: string };
type Flat = {
  id: number; building_id: number; wing_id: number; floor_id: number; flat_no: string;
  flat_type: string; carpet_area_sqft: string | number | null; builtup_area_sqft: string | number | null;
  occupancy_status: "OWNER_OCCUPIED" | "RENTED" | "VACANT"; status: string;
  building_name: string; wing_name: string; floor_name: string; floor_number: number;
};

export default function FlatsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Flat | null>(null);
  const [buildingId, setBuildingId] = useState("");
  const [wingId, setWingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [flatPrefix, setFlatPrefix] = useState("");
  const [startNumber, setStartNumber] = useState("1");
  const [numberOfFlats, setNumberOfFlats] = useState("");
  const [padLength, setPadLength] = useState("0");
  const [flatNo, setFlatNo] = useState("");
  const [flatType, setFlatType] = useState("2 BHK");
  const [carpetArea, setCarpetArea] = useState("");
  const [builtupArea, setBuiltupArea] = useState("");
  const [occupancy, setOccupancy] = useState<Flat["occupancy_status"]>("VACANT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    const session = getSocietySession();
    if (!session?.accessToken || !session.activeSociety) {
      setError("Please select a society before managing flats."); setLoading(false); return;
    }
    try {
      const headers = { Authorization: `Bearer ${session.accessToken}` };
      const responses = await Promise.all([
        fetch(`${API_URL}/society/buildings`, { headers }),
        fetch(`${API_URL}/society/floors`, { headers }),
        fetch(`${API_URL}/society/flats`, { headers }),
      ]);
      const results = await Promise.all(responses.map((response) => response.json().then((result) => ({ response, result }))));
      const failed = results.find(({ response, result }) => !response.ok || !result.success);
      if (failed) throw new Error(failed.result.message || "Unable to load flat setup data.");
      setBuildings(results[0].result.data ?? []); setFloors(results[1].result.data ?? []); setFlats(results[2].result.data ?? []);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load flats."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const selectedBuilding = buildings.find((building) => String(building.id) === buildingId);
  const availableWings = selectedBuilding?.wings ?? [];
  const availableFloors = floors.filter((floor) => String(floor.building_id) === buildingId && String(floor.wing_id) === wingId);

  const resetForm = () => {
    setBuildingId(""); setWingId(""); setFloorId(""); setFlatPrefix(""); setStartNumber("1");
    setNumberOfFlats(""); setPadLength("0"); setFlatNo(""); setFlatType("2 BHK");
    setCarpetArea(""); setBuiltupArea(""); setOccupancy("VACANT");
  };
  const openGenerate = () => { setEditing(null); resetForm(); setError(""); setSuccess(""); setDrawerOpen(true); };
  const openEdit = (flat: Flat) => {
    setEditing(flat); setFlatNo(flat.flat_no); setFlatType(flat.flat_type);
    setCarpetArea(flat.carpet_area_sqft == null ? "" : String(flat.carpet_area_sqft));
    setBuiltupArea(flat.builtup_area_sqft == null ? "" : String(flat.builtup_area_sqft));
    setOccupancy(flat.occupancy_status); setError(""); setSuccess(""); setDrawerOpen(true);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`${API_URL}${editing ? `/society/flats/${editing.id}` : "/society/flats/generate"}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify(editing ? {
          flat_no: flatNo, flat_type: flatType, carpet_area_sqft: carpetArea || null,
          builtup_area_sqft: builtupArea || null, occupancy_status: occupancy,
        } : {
          building_id: Number(buildingId), wing_id: Number(wingId), floor_id: Number(floorId),
          flat_prefix: flatPrefix, start_number: Number(startNumber), number_of_flats: Number(numberOfFlats),
          pad_length: Number(padLength), flat_type: flatType, carpet_area_sqft: carpetArea || null,
          builtup_area_sqft: builtupArea || null,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const validationMessage = Array.isArray(result.errors) ? result.errors.join(", ") : "";
        throw new Error(validationMessage || result.message || "Unable to save flats.");
      }
      setDrawerOpen(false); setEditing(null); resetForm();
      setSuccess(editing ? "Flat updated successfully." : `${result.data?.generated_count ?? numberOfFlats} flats generated successfully.`);
      await loadData();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save flats."); }
    finally { setSaving(false); }
  }

  async function handleDelete(flat: Flat) {
    if (!window.confirm(`Delete flat ${flat.flat_no}?`)) return;
    const session = getSocietySession();
    if (!session?.accessToken) return setError("Your session is missing. Please login again.");
    try {
      const response = await fetch(`${API_URL}/society/flats/${flat.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.accessToken}` } });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to delete flat.");
      setSuccess("Flat deleted successfully."); setError(""); await loadData();
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Unable to delete flat."); }
  }

  const occupancyLabel = (value: Flat["occupancy_status"]) => ({ OWNER_OCCUPIED: "Owner Occupied", RENTED: "Rented", VACANT: "Vacant" })[value];
  const columns: Column<Flat>[] = [
    { key: "flat_no", header: "Flat No.", render: (flat) => <span className="flex items-center gap-2 font-medium"><Home className="h-4 w-4 text-[var(--color-text-muted)]" />{flat.flat_no}</span> },
    { key: "building_name", header: "Building" }, { key: "wing_name", header: "Wing" },
    { key: "floor_name", header: "Floor" }, { key: "flat_type", header: "Type" },
    { key: "carpet_area_sqft", header: "Carpet Area", render: (flat) => flat.carpet_area_sqft ? `${flat.carpet_area_sqft} sqft` : "—" },
    { key: "occupancy_status", header: "Occupancy", render: (flat) => occupancyLabel(flat.occupancy_status) },
    { key: "status", header: "Status", render: (flat) => <StatusBadge status={flat.status === "ACTIVE" ? "Active" : "Inactive"} /> },
  ];

  return <div>
    <PageHeader title="Flats" description="Generate and manage flats for the selected society." actions={<Button onClick={openGenerate}><Plus className="h-4 w-4" /> Generate Flats</Button>} />
    {error && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]">{error}</p>}
    {success && <p className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]">{success}</p>}
    <Card><DataTable columns={columns} data={flats} keyField="id" searchFields={["flat_no", "building_name", "wing_name", "floor_name"]} searchPlaceholder={loading ? "Loading flats..." : "Search flats..."} filters={[
      { key: "building_name", label: "Building", options: buildings.map((building) => building.building_name) },
      { key: "occupancy_status", label: "Occupancy", options: ["OWNER_OCCUPIED", "RENTED", "VACANT"] },
    ]} rowActions={[
      { label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: openEdit },
      { label: "Delete", icon: <Trash2 className="h-4 w-4" />, onClick: (flat) => void handleDelete(flat), danger: true },
    ]} /></Card>

    <Drawer open={drawerOpen} onClose={() => !saving && setDrawerOpen(false)} width="560px" title={editing ? "Edit Flat" : "Generate Flats"} description={editing ? "Update flat details and occupancy." : "Select the structure and generate multiple flats."} footer={<><Button variant="outline" onClick={() => setDrawerOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" form="flat-form" loading={saving}>{editing ? "Update Flat" : "Generate Flats"}</Button></>}>
      <form id="flat-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {editing ? <>
          <Input label="Location" value={`${editing.building_name} / ${editing.wing_name} / ${editing.floor_name}`} disabled wrapperClassName="sm:col-span-2" />
          <Input label="Flat Number" required value={flatNo} onChange={(e) => setFlatNo(e.target.value.toUpperCase())} />
        </> : <>
          <Select label="Building" required placeholder="Select building" options={buildings.map((building) => ({ label: building.building_name, value: String(building.id) }))} value={buildingId} onChange={(e) => { setBuildingId(e.target.value); setWingId(""); setFloorId(""); const building = buildings.find((item) => String(item.id) === e.target.value); setNumberOfFlats(building ? String(building.flats_per_floor) : ""); }} wrapperClassName="sm:col-span-2" />
          <Select label="Wing" required placeholder="Select wing" options={availableWings.map((wing) => ({ label: wing.wing_name, value: String(wing.id) }))} value={wingId} onChange={(e) => { setWingId(e.target.value); setFloorId(""); }} disabled={!buildingId} />
          <Select label="Floor" required placeholder="Select floor" options={availableFloors.map((floor) => ({ label: floor.floor_name, value: String(floor.id) }))} value={floorId} onChange={(e) => { setFloorId(e.target.value); const floor = floors.find((item) => String(item.id) === e.target.value); const wing = availableWings.find((item) => String(item.id) === wingId); if (floor && wing) { setFlatPrefix(`${wing.wing_code}-`); setStartNumber(String(Math.max(0, floor.floor_number) * 100 + 1)); } }} disabled={!wingId} />
          <Input label="Flat Prefix" placeholder="e.g. A-" value={flatPrefix} onChange={(e) => setFlatPrefix(e.target.value.toUpperCase())} />
          <Input label="Start Number" type="number" min={0} required value={startNumber} onChange={(e) => setStartNumber(e.target.value)} />
          <Input label="Number of Flats" type="number" min={1} max={100} required value={numberOfFlats} onChange={(e) => setNumberOfFlats(e.target.value)} />
          <Input label="Number Padding" type="number" min={0} max={6} value={padLength} onChange={(e) => setPadLength(e.target.value)} helpText="Example: 3 makes 001, 002..." />
        </>}
        <Select label="Flat Type" required options={FLAT_TYPES.map((type) => ({ label: type, value: type }))} value={flatType} onChange={(e) => setFlatType(e.target.value)} />
        <Input label="Carpet Area (sqft)" type="number" min={0} step="0.01" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)} />
        <Input label="Built-up Area (sqft)" type="number" min={0} step="0.01" value={builtupArea} onChange={(e) => setBuiltupArea(e.target.value)} />
        {editing && <Select label="Occupancy" options={[
          { label: "Vacant", value: "VACANT" }, { label: "Owner Occupied", value: "OWNER_OCCUPIED" }, { label: "Rented", value: "RENTED" },
        ]} value={occupancy} onChange={(e) => setOccupancy(e.target.value as Flat["occupancy_status"])} />}
      </form>
    </Drawer>
  </div>;
}
