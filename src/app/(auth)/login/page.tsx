"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Checkbox } from "@/components/ui/Input";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to sign in. Please check your credentials.");
      }

      const storage = rememberMe ? window.localStorage : window.sessionStorage;
      const accessToken = result.data.access_token ?? result.data.accessToken;
      const refreshToken = result.data.refresh_token ?? result.data.refreshToken;
      const platformRoles = result.data.platform_roles ?? result.data.platformRoles ?? [];

      if (!accessToken || !refreshToken) {
        throw new Error("Login response did not include authentication tokens.");
      }

      storage.setItem("society_access_token", accessToken);
      storage.setItem("society_refresh_token", refreshToken);
      storage.setItem("society_user", JSON.stringify(result.data.user));
      storage.setItem("society_societies", JSON.stringify(result.data.societies ?? []));
      storage.setItem("society_platform_roles", JSON.stringify(platformRoles));
      storage.setItem("society_must_change_password", String(Boolean(result.data.must_change_password ?? result.data.mustChangePassword)));

      const isSuperAdmin = platformRoles.includes("SUPER_ADMIN");
      const requiresSocietySelection = result.data.requires_society_selection ?? result.data.requiresSocietySelection;
      const mustChangePassword = Boolean(result.data.must_change_password ?? result.data.mustChangePassword);
      const redirectPath = mustChangePassword
        ? "/change-password"
        : isSuperAdmin
        ? "/super-admin/societies"
        : requiresSocietySelection === true
          ? "/select-society"
          : "/dashboard";

      if (!isSuperAdmin && requiresSocietySelection !== true && result.data.societies?.length === 1) {
        storage.setItem("society_active", JSON.stringify(result.data.societies[0]));
      } else {
        storage.removeItem("society_active");
        storage.removeItem("society_active_roles");
      }
      router.push(redirectPath);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Welcome back</h1>
      <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">Sign in to manage your society operations.</p>

      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <Input
          label="Mobile Number / Email"
          required
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@society.org"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
        />
        <div>
          <Input
            label="Password"
            type="password"
            required
            icon={<Lock className="h-4 w-4" />}
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <Checkbox checked={rememberMe} onChange={setRememberMe} label="Remember me" />
            <Link href="/forgot-password" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && <p className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
        By signing in, you agree to the society&apos;s terms of use and privacy policy.
      </p>
    </div>
  );
}
