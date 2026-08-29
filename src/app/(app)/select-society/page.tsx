'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type SocietyOption = {
  id?: string | number;
  society_id?: string | number;
  code?: string;
  society_code?: string;
  name?: string;
  society_name?: string;
  city?: string;
  memberCount?: number;
};

function getStorageTarget() {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.localStorage.getItem("society_access_token")) {
    return window.localStorage;
  }

  if (window.sessionStorage.getItem("society_access_token")) {
    return window.sessionStorage;
  }

  return window.localStorage;
}

function getStoredSocieties(): SocietyOption[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storages = [window.localStorage, window.sessionStorage];

  for (const storage of storages) {
    const raw = storage.getItem("society_societies");
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as SocietyOption[];
      }
    } catch {
      // Ignore malformed cached payloads and fall through.
    }
  }

  return [];
}

export default function SelectSocietyPage() {
  const router = useRouter();
  const [societies, setSocieties] = useState<SocietyOption[]>([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // Check if user is Super Admin
      const userStr = localStorage.getItem("society_user") || sessionStorage.getItem("society_user");
      let user = null;
      let isAdmin = false;
      
      if (userStr) {
        try {
          user = JSON.parse(userStr);
          isAdmin = user.isSuperAdmin || false;
          setIsSuperAdmin(isAdmin);
        } catch (e) {
          // Invalid user data
        }
      }

      // If Super Admin, fetch all societies from API
      if (isAdmin) {
        await fetchAllSocieties();
      } else {
        // Normal user - get from stored societies
        const parsedSocieties = getStoredSocieties();
        setSocieties(parsedSocieties);
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  const fetchAllSocieties = async () => {
    try {
      const storage = getStorageTarget();
      const token = storage?.getItem("society_access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/societies`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch societies");
      }

      // Map API response to SocietyOption format
      const societiesList = (result.data || []).map((s: any) => ({
        id: s.id,
        society_id: s.id,
        name: s.society_name || s.name,
        society_name: s.society_name || s.name,
        code: s.society_code || s.code,
        society_code: s.society_code || s.code,
        city: s.city,
        memberCount: s.memberCount
      }));

      setSocieties(societiesList);
      
      // Store in localStorage for future use
      localStorage.setItem("society_societies", JSON.stringify(societiesList));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load societies");
      // If error, try to load from storage
      const parsedSocieties = getStoredSocieties();
      if (parsedSocieties.length > 0) {
        setSocieties(parsedSocieties);
      } else {
        setTimeout(() => router.push("/login"), 2000);
      }
    } finally {
      setInitializing(false);
    }
  };

  const selectedSociety = societies.find((society) => {
    const id = society.id ?? society.society_id;
    return String(id) === String(selectedSocietyId);
  });

  async function handleSubmit() {
    if (!selectedSocietyId) {
      setError("Please select a society to continue.");
      return;
    }

    const storage = getStorageTarget();
    if (!storage) {
      setError("Your session is missing. Please log in again.");
      return;
    }

    const token = storage.getItem("society_access_token");

    if (!token) {
      setError("Your session is missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/select-society`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ society_id: selectedSocietyId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to select a society.");
      }

      const nextAccessToken = result.data?.access_token ?? token;
      storage.setItem("society_access_token", nextAccessToken);
      storage.setItem("society_active", JSON.stringify(selectedSociety ?? { id: selectedSocietyId }));

      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to select a society.");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card>
          <CardBody className="flex min-h-[220px] items-center justify-center text-sm text-[var(--color-text-secondary)]">
            Loading societies...
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader
          title="Select Society"
          description={isSuperAdmin ? "Super Admin - Choose any society to manage" : "Choose the society you want to manage."}
        />

        <CardBody className="space-y-4">
          {societies.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
              No societies were found for this account.
            </div>
          ) : (
            <div className="space-y-3">
              {societies.map((society) => {
                const societyId = society.id ?? society.society_id;
                const name = society.name ?? society.society_name ?? "Unnamed Society";
                const code = society.code ?? society.society_code ?? "N/A";
                const isSelected = String(societyId) === String(selectedSocietyId);

                return (
                  <button
                    key={String(societyId)}
                    type="button"
                    onClick={() => setSelectedSocietyId(societyId ?? null)}
                    className={[
                      "w-full rounded-[var(--radius-lg)] border p-4 text-left transition-colors",
                      isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-border-strong)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-[var(--radius-md)] bg-[var(--color-bg)] p-2 text-[var(--color-primary)]">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-[var(--color-text-secondary)]">Code: {code}</p>
                            {(society as any).city && (
                              <>
                                <span className="text-xs text-[var(--color-text-muted)]">•</span>
                                <p className="text-xs text-[var(--color-text-secondary)]">{(society as any).city}</p>
                              </>
                            )}
                            {(society as any).memberCount !== undefined && (
                              <>
                                <span className="text-xs text-[var(--color-text-muted)]">•</span>
                                <p className="text-xs text-[var(--color-text-secondary)]">{(society as any).memberCount} members</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-primary)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            loading={loading}
            disabled={!selectedSocietyId || loading}
            className="w-full"
            onClick={handleSubmit}
          >
            Continue to Dashboard
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}