"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  return (
    <div>
      <Link href="/login" className="mb-6 flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to login
      </Link>
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Forgot password?</h1>
      <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
        Enter your registered email or mobile number and we&apos;ll send you a reset code.
      </p>
      <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); router.push("/otp-verification"); }}>
        <Input label="Mobile Number / Email" required icon={<Mail className="h-4 w-4" />} placeholder="you@society.org" />
        <Button type="submit" size="lg" className="mt-2">Send Reset Code</Button>
      </form>
    </div>
  );
}
