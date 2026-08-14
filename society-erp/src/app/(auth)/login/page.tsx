"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-[var(--primary)] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Building className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold">Society ERP</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight">
            Professional Housing Society<br />Management Platform
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Manage multiple societies, members, maintenance billing, complaints, parking, visitors and more — all in one place.
          </p>
        </div>
        <p className="text-sm text-blue-200">© 2026 Society ERP. All rights reserved.</p>
      </div>

      {/* Login form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 flex justify-center lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                <Building className="h-7 w-7" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text)]">Welcome back</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Sign in to your Society ERP account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="Mobile / Email"
              type="text"
              placeholder="9876543210 or admin@society.com"
              required
            />
            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]" />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-[var(--primary)] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
            Demo credentials: any email / any password
          </p>
        </div>
      </div>
    </div>
  );
}
