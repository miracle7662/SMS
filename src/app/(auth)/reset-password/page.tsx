"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Set a new password</h1>
      <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
        Choose a strong password you haven&apos;t used before.
      </p>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/login");
        }}
      >
        <Input label="New Password" type="password" required icon={<Lock className="h-4 w-4" />} helpText="Minimum 8 characters, with a number and symbol" />
        <Input label="Confirm New Password" type="password" required icon={<Lock className="h-4 w-4" />} />
        <Button type="submit" size="lg" className="mt-2">Reset Password</Button>
      </form>
    </div>
  );
}
