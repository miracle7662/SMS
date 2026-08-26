import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocietyOS | Housing Society Management ERP",
  description: "Enterprise ERP for managing housing societies, members, maintenance, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
