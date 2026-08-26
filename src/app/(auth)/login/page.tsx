"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Checkbox } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Welcome back</h1>
      <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">Sign in to manage your society operations.</p>

      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => router.push("/dashboard"), 600);
        }}
      >
        <Input label="Mobile Number / Email" required icon={<Mail className="h-4 w-4" />} placeholder="you@society.org" />
        <div>
          <Input label="Password" type="password" required icon={<Lock className="h-4 w-4" />} placeholder="••••••••" />
          <div className="mt-2 flex items-center justify-between">
            <Checkbox checked={true} onChange={() => {}} label="Remember me" />
            <Link href="/forgot-password" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
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
