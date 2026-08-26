import { Building } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white">
            <Building className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-[var(--color-text)]">SocietyOS</span>
        </div>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-[var(--color-primary)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <p className="text-sm font-medium text-white/70">Housing Society Management ERP</p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight text-white">
            Run your society operations from a single, modern dashboard.
          </h2>
        </div>
        <div className="relative rounded-[var(--radius-lg)] bg-white/10 p-5 backdrop-blur">
          <p className="text-sm text-white/90">
            &ldquo;SocietyOS cut our monthly billing and reconciliation time by more than half.&rdquo;
          </p>
          <p className="mt-3 text-xs text-white/60">— Secretary, Green Valley Co-operative Housing Society</p>
        </div>
      </div>
    </div>
  );
}
