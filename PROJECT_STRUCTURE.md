# Multi-Business SaaS Billing & POS System — Architecture & Project Structure

## 📌 1. Overview
This project is an enterprise-grade, multi-tenant SaaS Billing, Inventory Management, and Point of Sale (POS) system engineered for diverse retail and service industries (Supermarkets, Garments, Pharmacies, Hardware stores, Restaurants, Cafes, and Electronics stores).

It features:
- **Super Admin Control Center** for global SaaS tenant provisioning, subscription management, isolated database namespaces, metric aggregations, and impersonation.
- **Client Store Admin Panels** for daily POS billing, catalog management, staff attendance & payroll, customer CRM, barcode printing, and analytics.
- **Employee Portal & Time Clock** for employee check-in/out, biometric/PIN punching, shifts, leave requests, and payslips.
- **Public Storefront & Website Builder** for customer online ordering, menu browsing, and custom storefront publishing.

---

## 🗂️ 2. High-Level Folder Tree

```text
Multi_business_billing_system/
├── api/                             # Serverless API handlers & endpoints
│   ├── auth/                        # Authentication endpoints
│   └── index.ts                     # Vercel serverless entry point
├── prisma/                          # Database ORM & Migrations
│   ├── schema.prisma                # Relational multi-business PostgreSQL/SQLite schema
│   └── migrations/                  # Historical migration records
├── server/                          # Local Express backend server
│   ├── index.ts                     # REST API routes (auth, inventory, orders, settings, metrics)
│   └── db.ts                        # Prisma Client database singleton
├── src/                             # Frontend React + TypeScript application
│   ├── components/                  # Reusable UI widgets, modals & navigation
│   │   ├── notifications/           # Notification bell & alerts system
│   │   ├── ErrorBoundary.tsx        # React runtime error boundary
│   │   ├── PrintInvoiceModal.tsx    # Thermal (58mm/80mm) & A4 GST Invoice Generator
│   │   └── SuperAdminImpersonationBanner.tsx # Top bar during Super Admin client mode
│   ├── context/                     # Global State Management
│   │   └── AuthContext.tsx          # Auth state, business profile, role RBAC, SaaS tenants
│   ├── layouts/                     # Page frame wrappers
│   │   └── DashboardLayout.tsx      # Client Store Admin collapsible sidebar & topbar
│   ├── lib/                         # Business logic & Domain engines
│   │   ├── attendance/              # Attendance calculation, GPS punch, work duration
│   │   ├── auth/                    # Client & staff authentication helpers
│   │   ├── database/                # LocalStorage + IndexedDB database wrappers
│   │   ├── employees/               # Staff directory, roles, and payroll calculator
│   │   ├── modules/                 # Modular toggle engine (Billing, Menu, CRM, Stock)
│   │   ├── permissions/             # Granular RBAC permission checks
│   │   ├── templates/               # Industry templates (Garments, Pharmacy, Restaurant)
│   │   ├── tenant/                  # Multi-tenant isolation engine & SaaS registry
│   │   ├── theme/                   # Dynamic theming & brand palette engine
│   │   └── utils.ts                 # Formatting, currency, and date utilities
│   ├── pages/                       # Route Page Views
│   │   ├── BillingPOS.tsx           # High-speed Point of Sale terminal with barcode scanning
│   │   ├── Customers.tsx            # Customer CRM, credit ledgers, and transaction history
│   │   ├── Dashboard.tsx            # Client Store Executive analytics, KPIs & charts
│   │   ├── EmployeeDirectory.tsx    # Staff management, salary configuration, roles
│   │   ├── EmployeeLogin.tsx        # Dedicated PIN / Phone staff punch login
│   │   ├── EmployeePortal.tsx       # Employee self-service dashboard (shifts, leaves)
│   │   ├── Inventory.tsx            # Product catalog, stock alerts, variants, suppliers
│   │   ├── LandingPage.tsx          # Public SaaS marketing landing page
│   │   ├── Login.tsx                # Universal Login (Client Store Admin & Super Admin)
│   │   ├── MenuManagement.tsx       # Restaurant table layout & digital menu ordering
│   │   ├── Orders.tsx               # Order history, refund processing, and invoice tracking
│   │   ├── PublicStorefront.tsx     # Customer-facing online catalog & e-commerce shop
│   │   ├── Reports.tsx              # Detailed GST, sales, profit, and tax reporting
│   │   ├── Settings.tsx             # Business profile, thermal printer setup, invoice layout
│   │   ├── StaffAttendance.tsx      # Timeclock punch log, leave management, shifts
│   │   ├── SuperAdmin.tsx           # SaaS Control Center (Tenants, MRR, Backups, Plans)
│   │   └── WebsiteBuilder.tsx       # WYSIWYG public storefront website editor
│   ├── types/                       # TypeScript Type Definitions
│   │   ├── employee.ts              # Staff, attendance, shift, payroll types
│   │   ├── module.ts                # Modular capability toggles
│   │   ├── template.ts              # Business type interfaces
│   │   └── website.ts               # Website builder block & page schemas
│   ├── App.tsx                      # App router, lazy-loaded routes & protected guards
│   ├── index.css                    # Tailwind / Vanilla CSS design tokens & animations
│   └── main.tsx                     # React 18 root mounting
├── index.html                       # HTML5 template entry point
├── package.json                     # Dependencies, scripts & build pipelines
├── tsconfig.json                    # TypeScript compiler configuration
├── vercel.json                      # Vercel deployment routes & SPA rewrite rules
└── vite.config.ts                   # Vite bundler configuration & dev server proxy
```

---

## 🏛️ 3. Core Architectural Modules

### 1. Multi-Tenant SaaS Isolation Engine (`src/lib/tenant/tenantEngine.ts`)
* **Namespace Isolation**: Each client business has its data scoped to `tenant_${tenantId}_*` in database storage.
* **Master SaaS Registry**: Manages subscriptions (Trial, Starter, Growth, Pro, Enterprise), monthly quotas, and renewal lifecycles.
* **Auto-Provisioning**: Onboarding a new tenant automatically seeds industry-tailored inventory categories, suppliers, and tax presets.

### 2. Authentication & Role-Based Access Control (`src/context/AuthContext.tsx`)
* **Super Admin**: Complete master authority to manage tenants, export system backups, and impersonate any client store.
* **Store Admin**: Full control over store inventory, POS billing, staff records, and financials.
* **Manager / Cashier / Staff**: Granular access to POS, attendance, or read-only reports.

### 3. Point of Sale & Invoicing (`src/pages/BillingPOS.tsx` & `PrintInvoiceModal.tsx`)
* Real-time barcode scanning, item search, quantity toggles, discounts, and payment methods (Cash, UPI, Card, Store Credit).
* Dual thermal printer support: **80mm Receipt**, **58mm Receipt**, and **A4 Detailed GST Invoice**.

### 4. Staff Attendance & Employee Portal (`src/pages/StaffAttendance.tsx` & `EmployeePortal.tsx`)
* Timeclock with PIN-based punching, shift scheduling, leave approval workflows, and payroll generation.

### 5. Website Builder & Public Storefront (`src/pages/WebsiteBuilder.tsx` & `PublicStorefront.tsx`)
* Built-in visual editor enabling store owners to publish digital product catalogs and accept online orders.

---

## 🚀 4. Deployment & Build Commands

```bash
# Run local development server (Frontend + Local Backend)
npm run dev

# Compile TypeScript and build production bundle
npm run build

# Deploy directly to Vercel production
npx vercel deploy --prod --yes
```
