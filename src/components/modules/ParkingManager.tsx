"use client";

import { useCallback, useEffect, useState } from "react";
import { Car, LogOut, Plus } from "lucide-react";

import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Drawer } from "@/components/ui/Drawer";
import { Input, Select, Switch } from "@/components/ui/Input";
import { getSocietySession } from "@/lib/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type ParkingMode = "slots" | "vehicles" | "allocation";

type Slot = {
  id: number;
  slot_number: string;
  slot_type: string;
  location: string | null;
  is_reserved: boolean;
  availability: string;
  allocation_id: number | null;
  flat_no: string | null;
  wing_name: string | null;
  vehicle_number: string | null;
};

type Vehicle = {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  owner_name: string | null;
  flat_no: string;
  wing_name: string;
  slot_number: string | null;
};

type ParkingData = {
  slots: Slot[];
  vehicles: Vehicle[];
  options: {
    flats: Array<{
      id: number;
      label: string;
    }>;
  };
};

type SlotForm = {
  slot_number: string;
  slot_type: string;
  location: string;
  is_reserved: boolean;
};

type VehicleForm = {
  flat_id: string;
  vehicle_number: string;
  vehicle_type: string;
  brand: string;
  model: string;
  color: string;
};

type AllocationForm = {
  slot_id: string;
  vehicle_id: string;
  allocated_from: string;
};

type ParkingManagerProps = {
  mode: ParkingMode;
};

const initialData: ParkingData = {
  slots: [],
  vehicles: [],
  options: {
    flats: [],
  },
};

const initialSlot: SlotForm = {
  slot_number: "",
  slot_type: "FOUR_WHEELER",
  location: "",
  is_reserved: false,
};

const initialVehicle: VehicleForm = {
  flat_id: "",
  vehicle_number: "",
  vehicle_type: "CAR",
  brand: "",
  model: "",
  color: "",
};

function createInitialAllocation(): AllocationForm {
  return {
    slot_id: "",
    vehicle_id: "",
    allocated_from: new Date().toISOString().slice(0, 10),
  };
}

function formatTitle(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

async function parseApiResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message: "Invalid response received from the server.",
    };
  }
}

export function ParkingManager({ mode }: ParkingManagerProps) {
  const [data, setData] = useState<ParkingData>(initialData);
  const [slot, setSlot] = useState<SlotForm>(initialSlot);
  const [vehicle, setVehicle] = useState<VehicleForm>(initialVehicle);
  const [allocation, setAllocation] = useState<AllocationForm>(
    createInitialAllocation,
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadParkingData = useCallback(async () => {
    const session = getSocietySession();

    if (!session?.accessToken) {
      setError("Please login and select a society.");
      setInitialLoading(false);
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/society/parking`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      });

      const result = await parseApiResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load parking information.",
        );
      }

      setData({
        slots: result.data?.slots ?? [],
        vehicles: result.data?.vehicles ?? [],
        options: {
          flats: result.data?.options?.flats ?? [],
        },
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load parking information.",
      );
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadParkingData();
  }, [loadParkingData]);

  async function createParkingRecord(path: string, body: object) {
    const session = getSocietySession();

    if (!session?.accessToken) {
      setError("Please login and select a society.");
      return false;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/society/parking/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const result = await parseApiResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to complete the parking operation.",
        );
      }

      setNotice(result.message || "Parking information saved successfully.");
      setDrawerOpen(false);

      await loadParkingData();

      return true;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete the parking operation.",
      );

      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleRelease(allocationId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to release this parking allocation?",
    );

    if (!confirmed) {
      return;
    }

    await createParkingRecord(
      `allocations/${allocationId}/release`,
      {},
    );
  }

  async function handleSaveSlot() {
    const saved = await createParkingRecord("slots", {
      slot_number: slot.slot_number.trim(),
      slot_type: slot.slot_type,
      location: slot.location.trim() || null,
      is_reserved: slot.is_reserved,
    });

    if (saved) {
      setSlot(initialSlot);
    }
  }

  async function handleSaveVehicle() {
    const flatId = Number(vehicle.flat_id);

    if (!Number.isInteger(flatId) || flatId <= 0) {
      setError("Please select a valid flat.");
      return;
    }

    const saved = await createParkingRecord("vehicles", {
      flat_id: flatId,
      vehicle_number: vehicle.vehicle_number.trim().toUpperCase(),
      vehicle_type: vehicle.vehicle_type,
      brand: vehicle.brand.trim() || null,
      model: vehicle.model.trim() || null,
      color: vehicle.color.trim() || null,
    });

    if (saved) {
      setVehicle(initialVehicle);
    }
  }

  async function handleAllocation() {
    const slotId = Number(allocation.slot_id);
    const vehicleId = Number(allocation.vehicle_id);

    if (!Number.isInteger(slotId) || slotId <= 0) {
      setError("Please select a valid parking slot.");
      return;
    }

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      setError("Please select a valid vehicle.");
      return;
    }

    const saved = await createParkingRecord("allocations", {
      slot_id: slotId,
      vehicle_id: vehicleId,
      allocated_from: allocation.allocated_from,
    });

    if (saved) {
      setAllocation(createInitialAllocation());
    }
  }

  const slotColumns: Column<Slot>[] = [
    {
      key: "slot_number",
      header: "Slot No.",
    },
    {
      key: "slot_type",
      header: "Type",
      render: (parkingSlot) => (
        <Badge>{formatTitle(parkingSlot.slot_type)}</Badge>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (parkingSlot) => parkingSlot.location || "—",
    },
    {
      key: "flat_no",
      header: "Allocated Flat",
      render: (parkingSlot) =>
        parkingSlot.flat_no
          ? `${parkingSlot.wing_name ?? ""}-${parkingSlot.flat_no}`
          : "—",
    },
    {
      key: "vehicle_number",
      header: "Vehicle",
      render: (parkingSlot) => parkingSlot.vehicle_number || "—",
    },
    {
      key: "availability",
      header: "Status",
      render: (parkingSlot) => (
        <StatusBadge status={formatTitle(parkingSlot.availability)} />
      ),
    },
  ];

  const vehicleColumns: Column<Vehicle>[] = [
    {
      key: "vehicle_number",
      header: "Vehicle No.",
      render: (parkingVehicle) => (
        <span className="flex items-center gap-2 font-medium">
          <Car className="h-4 w-4" />
          {parkingVehicle.vehicle_number}
        </span>
      ),
    },
    {
      key: "vehicle_type",
      header: "Type",
      render: (parkingVehicle) => (
        <Badge>{formatTitle(parkingVehicle.vehicle_type)}</Badge>
      ),
    },
    {
      key: "brand",
      header: "Brand / Model",
      render: (parkingVehicle) => {
        const brandAndModel = [
          parkingVehicle.brand,
          parkingVehicle.model,
        ]
          .filter(Boolean)
          .join(" ");

        return brandAndModel || "—";
      },
    },
    {
      key: "color",
      header: "Color",
      render: (parkingVehicle) => parkingVehicle.color || "—",
    },
    {
      key: "owner_name",
      header: "Owner",
      render: (parkingVehicle) => parkingVehicle.owner_name || "—",
    },
    {
      key: "flat_no",
      header: "Flat",
      render: (parkingVehicle) =>
        `${parkingVehicle.wing_name}-${parkingVehicle.flat_no}`,
    },
    {
      key: "slot_number",
      header: "Slot",
      render: (parkingVehicle) =>
        parkingVehicle.slot_number || "Not allocated",
    },
  ];

  if (mode === "allocation") {
    const availableSlots = data.slots.filter(
      (parkingSlot) => parkingSlot.availability === "AVAILABLE",
    );

    const unallocatedVehicles = data.vehicles.filter(
      (parkingVehicle) => !parkingVehicle.slot_number,
    );

    const activeAllocations = data.slots.filter(
      (parkingSlot) => parkingSlot.allocation_id !== null,
    );

    return (
      <>
        <Messages error={error} notice={notice} />

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="New Parking Allocation" />

            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Vehicle"
                value={allocation.vehicle_id}
                onChange={(event) =>
                  setAllocation({
                    ...allocation,
                    vehicle_id: event.target.value,
                  })
                }
                options={unallocatedVehicles.map((parkingVehicle) => ({
                  value: String(parkingVehicle.id),
                  label: `${parkingVehicle.vehicle_number} · ${parkingVehicle.wing_name}-${parkingVehicle.flat_no}`,
                }))}
                placeholder="Select vehicle"
              />

              <Select
                label="Available Slot"
                value={allocation.slot_id}
                onChange={(event) =>
                  setAllocation({
                    ...allocation,
                    slot_id: event.target.value,
                  })
                }
                options={availableSlots.map((parkingSlot) => ({
                  value: String(parkingSlot.id),
                  label: `${parkingSlot.slot_number} · ${formatTitle(
                    parkingSlot.slot_type,
                  )}`,
                }))}
                placeholder="Select slot"
              />

              <Input
                label="Allocated From"
                type="date"
                value={allocation.allocated_from}
                onChange={(event) =>
                  setAllocation({
                    ...allocation,
                    allocated_from: event.target.value,
                  })
                }
              />

              <div className="flex items-end">
                <Button
                  className="w-full"
                  loading={loading}
                  onClick={() => void handleAllocation()}
                >
                  Allocate Slot
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Active Allocations" />

            {initialLoading ? (
              <p className="p-4 text-sm text-[var(--color-text-muted)]">
                Loading allocations...
              </p>
            ) : activeAllocations.length === 0 ? (
              <p className="p-4 text-sm text-[var(--color-text-muted)]">
                No active parking allocations found.
              </p>
            ) : (
              <div className="divide-y">
                {activeAllocations.map((parkingSlot) => (
                  <div
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                    key={parkingSlot.id}
                  >
                    <div>
                      <p className="font-medium">
                        {parkingSlot.slot_number}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {parkingSlot.vehicle_number || "No vehicle"}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loading}
                      onClick={() =>
                        void handleRelease(
                          Number(parkingSlot.allocation_id),
                        )
                      }
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  const isSlotMode = mode === "slots";

  const addButton = (
    <Button size="sm" onClick={() => setDrawerOpen(true)}>
      <Plus className="h-4 w-4" />
      {isSlotMode ? "Add Slot" : "Add Vehicle"}
    </Button>
  );

  return (
    <>
      <Messages error={error} notice={notice} />

      <Card>
        {initialLoading ? (
          <p className="p-5 text-sm text-[var(--color-text-muted)]">
            Loading parking information...
          </p>
        ) : isSlotMode ? (
          <DataTable<Slot>
            columns={slotColumns}
            data={data.slots}
            keyField="id"
            addButton={addButton}
          />
        ) : (
          <DataTable<Vehicle>
            columns={vehicleColumns}
            data={data.vehicles}
            keyField="id"
            addButton={addButton}
          />
        )}
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isSlotMode ? "Add Parking Slot" : "Register Vehicle"}
        footer={
          <Button
            loading={loading}
            onClick={() =>
              void (isSlotMode ? handleSaveSlot() : handleSaveVehicle())
            }
          >
            Save
          </Button>
        }
      >
        {isSlotMode ? (
          <div className="space-y-4">
            <Input
              label="Slot Number"
              value={slot.slot_number}
              onChange={(event) =>
                setSlot({
                  ...slot,
                  slot_number: event.target.value,
                })
              }
            />

            <Select
              label="Slot Type"
              value={slot.slot_type}
              onChange={(event) =>
                setSlot({
                  ...slot,
                  slot_type: event.target.value,
                })
              }
              options={[
                "TWO_WHEELER",
                "FOUR_WHEELER",
                "BICYCLE",
                "OTHER",
              ].map((value) => ({
                value,
                label: formatTitle(value),
              }))}
            />

            <Input
              label="Location"
              value={slot.location}
              onChange={(event) =>
                setSlot({
                  ...slot,
                  location: event.target.value,
                })
              }
            />

            <Switch
              label="Reserved Slot"
              checked={slot.is_reserved}
              onChange={(checked) =>
                setSlot({
                  ...slot,
                  is_reserved: checked,
                })
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label="Flat"
              value={vehicle.flat_id}
              onChange={(event) =>
                setVehicle({
                  ...vehicle,
                  flat_id: event.target.value,
                })
              }
              options={data.options.flats.map((flat) => ({
                value: String(flat.id),
                label: flat.label,
              }))}
              placeholder="Select flat"
            />

            <Input
              label="Vehicle Number"
              value={vehicle.vehicle_number}
              onChange={(event) =>
                setVehicle({
                  ...vehicle,
                  vehicle_number: event.target.value,
                })
              }
            />

            <Select
              label="Vehicle Type"
              value={vehicle.vehicle_type}
              onChange={(event) =>
                setVehicle({
                  ...vehicle,
                  vehicle_type: event.target.value,
                })
              }
              options={[
                "CAR",
                "BIKE",
                "SCOOTER",
                "BICYCLE",
                "OTHER",
              ].map((value) => ({
                value,
                label: formatTitle(value),
              }))}
            />

            <Input
              label="Brand"
              value={vehicle.brand}
              onChange={(event) =>
                setVehicle({
                  ...vehicle,
                  brand: event.target.value,
                })
              }
            />

            <Input
              label="Model"
              value={vehicle.model}
              onChange={(event) =>
                setVehicle({
                  ...vehicle,
                  model: event.target.value,
                })
              }
            />

            <Input
              label="Color"
              value={vehicle.color}
              onChange={(event) =>
                setVehicle({
                  ...vehicle,
                  color: event.target.value,
                })
              }
            />
          </div>
        )}
      </Drawer>
    </>
  );
}

function Messages({
  error,
  notice,
}: {
  error: string;
  notice: string;
}) {
  return (
    <>
      {error ? (
        <p className="mb-4 rounded-md bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="mb-4 rounded-md bg-[var(--color-success)]/10 p-3 text-sm text-[var(--color-success)]">
          {notice}
        </p>
      ) : null}
    </>
  );
}