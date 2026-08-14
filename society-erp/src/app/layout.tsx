import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Society ERP | Housing Society Management",
  description: "Professional Housing Society Management ERP for managing societies, members, maintenance, complaints and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
