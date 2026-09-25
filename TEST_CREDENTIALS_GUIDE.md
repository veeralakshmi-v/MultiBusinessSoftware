# 📋 Multi-Business Billing & POS System — Test User Credentials & Testing Guide

**Live Deployment URL:** [https://multi-business-billing-system.vercel.app/](https://multi-business-billing-system.vercel.app/)

---

## 🔐 1. Store / Business Administrator Logins

Use these accounts to test full administrative capabilities: POS billing, product catalogs, inventory management, multi-industry business template switching, sales reports, GST/tax settings, staff directory, and platform analytics.

- **Admin Login Page:** [https://multi-business-billing-system.vercel.app/login](https://multi-business-billing-system.vercel.app/login)

| Business Industry / Tenant | Username | Password | Role & Permissions | Key Features to Test |
| :--- | :--- | :--- | :--- | :--- |
| **Universal Super Admin** | `admin` | `admin123` | **Full Platform Admin** | All business modules, template switcher, user management, system settings |
| **Supermarket & Retail Admin** (VeeGo) | `kousi` | `kousi123` | **Supermarket Admin** | Barcode scanning, SKU inventory, batch stock, receipt customization |
| **Restaurant & Cafe Admin** | `restaurant_admin` | `admin123` | **Restaurant Admin** | Table layouts, KOT management, kitchen section routing, dietary tags |
| **Pharmacy / Healthcare Admin** | `suriya` | `suriya123` | **Medical Admin** | Drug batch tracking, expiry date monitoring, doctor prescriptions |
| **Garments & Apparel Admin** | `fashion_admin` | `admin123` | **Fashion Admin** | Multi-variant matrices (Size, Color, Brand), seasonal discounts |

---

## 💳 2. Cashier & Operational Staff Logins

Use these credentials to test high-speed POS billing, barcode searching, rapid cart operations, discounts, multiple payment modes (Cash, UPI, Card), and receipt generation.

- **Store Login Page:** [https://multi-business-billing-system.vercel.app/login](https://multi-business-billing-system.vercel.app/login)

| Station / Role | Username / Phone | Password / PIN | Access Level | Primary Testing Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Supermarket Cashier** | `cashier` | `1234` | **CASHIER** | Fast billing grid, barcode lookup, invoice printing |
| **Supermarket Cashier (Phone Login)** | `8939242577` | `1234` | **CASHIER** | Customer lookup by phone, quick sale checkout |
| **Pharmacy Billing Executive** | `8939242578` | `1234` | **CASHIER** | Medical bill creation, GST invoice printing |
| **Kitchen Operations Lead** | `chef_mario` | `1234` | **KITCHEN_STAFF** | Live Kitchen Display System (KDS), order preparation status |

---

## ⏱️ 3. Employee Self-Service & Attendance Portal

Use these credentials to test employee clock-in / clock-out with GPS geofencing, break tracking, shift summaries, and leave applications.

- **Employee Portal URL:** [https://multi-business-billing-system.vercel.app/employee-login](https://multi-business-billing-system.vercel.app/employee-login)

| Employee Name | Employee ID / Phone | PIN Code | Department & Designation | Features to Test |
| :--- | :--- | :--- | :--- | :--- |
| **Kharalya (Cashier)** | `8939242577` *(or `EMP-1001`)* | `1234` | Retail Sales / Head Cashier | Punch IN/OUT, daily work duration, break timer |
| **Ramesh Kumar (Staff)** | `9876500001` *(or `EMP-1002`)* | `1234` | Inventory / Stock Executive | Leave request submission, shift view |
| **Mario (Kitchen Lead)** | `9876500002` *(or `EMP-2001`)* | `1234` | Kitchen & F&B / Executive Chef | Shift attendance, break logging |
| **Manoj (Pharmacist)** | `8939242578` *(or `EMP-3001`)* | `1234` | Pharmacy / Dispenser | Employee dashboard, attendance history |

---

## 🧪 4. Step-by-Step Testing Checklist for QA & Reviewers

### Test Flow A: Multi-Industry POS & Billing
1. Navigate to [https://multi-business-billing-system.vercel.app/login](https://multi-business-billing-system.vercel.app/login)
2. Log in with `admin` / `admin123`.
3. Open **Settings** -> **Business Template**.
4. Switch across different business types (**Supermarket**, **Restaurant**, **Medical**, **Garments**) and verify how POS layouts and labels dynamically adapt.
5. Create a new bill in **POS Billing**, apply a discount, choose **UPI** or **Cash**, and click **Complete & Print Bill**.

### Test Flow B: Cashier Point of Sale
1. Sign in with `cashier` and PIN `1234`.
2. Add products using instant search or category tabs.
3. Test quantity increments, customer phone number attachment, and thermal receipt preview.

### Test Flow C: Geofenced Employee Attendance
1. Navigate to [https://multi-business-billing-system.vercel.app/employee-login](https://multi-business-billing-system.vercel.app/employee-login)
2. Enter Phone/ID: `8939242577` and PIN: `1234`.
3. Click **Punch IN** (allow location access for GPS verification).
4. Start a **Break (Lunch / Tea)** and resume work.
5. Submit a **Leave Request** (Casual / Sick / Earned) and verify the status list.

---

## 🛠️ Need Help or More Test Data?
- To reset or re-seed default test accounts, execute: `npx tsx scripts/seed-test-users.ts`
- All accounts are backed by live cloud storage and PostgreSQL.
