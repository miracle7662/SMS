# SocietyOS — Housing Society Management ERP

A production-ready admin dashboard theme for a multi-society housing management ERP, built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and Lucide icons.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/dashboard`.

To view the auth flow, visit `/login`, `/forgot-password`, `/otp-verification`, `/reset-password`.

## Tech Stack

- Next.js 16 (App Router, TypeScript strict mode)
- Tailwind CSS v4 with a full CSS-variable design token system (light + dark mode)
- Lucide React icons
- No UI kit, no Bootstrap, no jQuery — all components hand-built and reusable

## Project Structure

```
src/
  app/
    (auth)/         Login, Forgot Password, OTP, Reset Password
    (app)/           Main ERP app (sidebar + header shell), one folder per module
  components/
    ui/              Reusable primitives: Button, Input, Select, DataTable, Modal, Drawer, Tabs, etc.
    layout/          Sidebar, Header, Breadcrumb, PageHeader, AppShell
    dashboard/       StatCard, CollectionChart
    modules/          Shared list views reused across sibling routes (BillsList, ComplaintsList, MembersByType, ReportShell, etc.)
  lib/
    mock-data.ts     Realistic Indian-context mock data (names, ₹ currency, mobile numbers)
    nav.ts           Sidebar navigation config
    utils.ts         Formatting helpers
  types/
    index.ts         Domain types for every entity (Flat, Tenant, Bill, Complaint, etc.)
```

## Notes

- All data is mocked in `src/lib/mock-data.ts` — swap this out for real API calls (or the planned Node.js + Express + MySQL backend) without touching UI components.
- The `DataTable` component (`src/components/ui/DataTable.tsx`) powers every list page: search, column visibility, sorting, filters, pagination, bulk actions, and row actions are all built in and reusable.
- Dark mode is fully wired via CSS variables (see `src/app/globals.css`) and toggled from the header.
- Every link in the sidebar navigates to a real, working page — there are no dead ends.
