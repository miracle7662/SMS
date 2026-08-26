"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OtpVerificationPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  return (
    <div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">Enter verification code</h1>
      <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
        We&apos;ve sent a 6-digit code to your registered mobile number ending in ••34.
      </p>

      <form
        className="mt-8 flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/reset-password");
        }}
      >
        <div className="flex justify-between gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              maxLength={1}
              className="h-12 w-12 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] text-center text-lg font-semibold text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            />
          ))}
        </div>
        <Button type="submit" size="lg">Verify Code</Button>
        <p className="text-center text-xs text-[var(--color-text-secondary)]">
          Didn&apos;t receive the code? <button type="button" className="font-medium text-[var(--color-primary)]">Resend</button>
        </p>
      </form>
    </div>
  );
}
