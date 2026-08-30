export type StoredUser = {
  id: number;
  name: string;
  mobile?: string | null;
  email?: string | null;
};

export type ActiveSociety = {
  id: number | string;
  code?: string;
  name?: string;
  society_code?: string;
  society_name?: string;
  logo?: string | null;
};

export type SocietySession = {
  storage: Storage;
  accessToken: string;
  refreshToken: string | null;
  user: StoredUser | null;
  platformRoles: string[];
  activeSociety: ActiveSociety | null;
  isSuperAdmin: boolean;
};

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export function getSocietySession(): SocietySession | null {
  if (typeof window === "undefined") return null;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const accessToken = storage.getItem("society_access_token");
    if (!accessToken) continue;
    const platformRoles = parseJson<string[]>(storage.getItem("society_platform_roles"), []);
    return {
      storage,
      accessToken,
      refreshToken: storage.getItem("society_refresh_token"),
      user: parseJson<StoredUser | null>(storage.getItem("society_user"), null),
      platformRoles,
      activeSociety: parseJson<ActiveSociety | null>(storage.getItem("society_active"), null),
      isSuperAdmin: platformRoles.includes("SUPER_ADMIN"),
    };
  }

  return null;
}

export function saveActiveSociety(storage: Storage, society: ActiveSociety, accessToken: string, roles: string[] = []) {
  storage.setItem("society_active", JSON.stringify(society));
  storage.setItem("society_access_token", accessToken);
  storage.setItem("society_active_roles", JSON.stringify(roles));
  window.dispatchEvent(new Event("society-session-changed"));
}

export function clearActiveSociety(storage: Storage) {
  storage.removeItem("society_active");
  storage.removeItem("society_active_roles");
  window.dispatchEvent(new Event("society-session-changed"));
}

export function clearSocietySession() {
  if (typeof window === "undefined") return;
  const keys = [
    "society_access_token",
    "society_refresh_token",
    "society_user",
    "society_societies",
    "society_platform_roles",
    "society_active",
    "society_active_roles",
    "society_must_change_password",
  ];
  for (const storage of [window.localStorage, window.sessionStorage]) {
    keys.forEach((key) => storage.removeItem(key));
  }
  window.dispatchEvent(new Event("society-session-changed"));
}
