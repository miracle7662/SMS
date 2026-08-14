# Society ERP - Housing Society Management Admin Dashboard

Professional, production-ready Society Management ERP Admin Dashboard built with Next.js App Router, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS v4** (CSS variables theme system)
- **React 19**
- **Lucide React** icons
- **Recharts** for charts
- Fully responsive (Desktop / Tablet / Mobile)
- Light + Dark mode via CSS variables
- No Bootstrap, no jQuery, no heavy UI libraries

## Features Implemented

### Core Layout
- Collapsible sidebar with nested navigation matching full product IA
- Header with search, notifications, theme toggle, user menu
- Responsive: sidebar becomes drawer on mobile
- Breadcrumbs + PageHeader component

### Dashboard
- Society / Building / FY selectors
- 8 KPI cards with trends
- Maintenance collection chart (Recharts)
- Pending bills, Defaulters, Complaints summary
- Recent payments, Notices, Expiring tenant agreements
- Parking summary

### Modules with Full UI
- **Tenants** – searchable table, status badges, actions
- **Flats** – occupancy status, filters
- **Complaints** – status tabs, priority badges

### Scaffolded Modules (ready for expansion)
Society Profile, Buildings, Floors, Members, Owners, Family Members, Documents,  
Maintenance (Charges, Bills, Defaulters), Payments, Notices, Parking, Visitors,  
Amenities, Vendors, Expenses, Documents, Reports, Users & Roles, Settings

### Design System
- CSS variables for primary (#2563EB), success, warning, danger, surfaces
- Reusable: Button, Badge, Card, Input, EmptyState, StatCard, PageHeader
- Status badges for all ERP states (Paid, Overdue, Open, Resolved, etc.)
- Indian locale: ₹ currency, Indian names, mobile format, dates

### Auth
- Login page with branding panel (demo: any credentials → dashboard)

## Getting Started

```bash
cd society-erp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to the dashboard. Use `/login` for the auth screen.

## Project Structure

```
src/
  app/
    (auth)/login/
    (dashboard)/
      layout.tsx          # Sidebar + Header shell
      dashboard/
      society/...
      members/...
      maintenance/...
      ...
  components/
    ui/                   # Button, Badge, Card, Input, EmptyState
    layout/               # Sidebar, Header, PageHeader
    dashboard/            # StatCard
  data/mock.ts            # Realistic Indian mock data
  types/index.ts
  lib/utils.ts            # cn, formatCurrency, formatDate
```

## Next Steps for Production

1. Replace mock data with API layer (`src/lib/api/`)
2. Add React Hook Form + Zod validation on forms
3. Implement DataTable with sorting/pagination
4. Add role-based route guards
5. Connect to Node.js + Express + MySQL backend
6. Add real-time notifications

## Brand Colors (CSS Variables)

| Token        | Value     |
|-------------|-----------|
| Primary     | #2563EB   |
| Secondary   | #1D4ED8   |
| Success     | #16A34A   |
| Warning     | #F59E0B   |
| Danger      | #DC2626   |
| Background  | #F8FAFC   |
| Card        | #FFFFFF   |
| Text        | #111827   |

Dark mode is supported via `.dark` class on `<html>`.

---

Built as a commercial-grade SaaS ERP foundation for housing societies.
