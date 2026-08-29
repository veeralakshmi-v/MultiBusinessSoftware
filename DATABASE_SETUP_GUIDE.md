# 🗄️ Database Setup & Cross-System Troubleshooting Guide

This document explains how to set up, run, and troubleshoot the database for the **Multi-Business Billing System** across different computers, operating systems, and deployment platforms (Vercel, Render, Railway, Supabase, Neon).

---

## 🚀 Quick Setup for a New Computer / Fresh Clone

When cloning this project on another computer (Windows, macOS, Linux):

### 1. Install Dependencies
```bash
npm install
```
> *Note: `npm install` automatically triggers `prisma generate` via postinstall to build platform-native Prisma binaries for your machine.*

### 2. Configure Environment Variables
Ensure a `.env` file exists in the root directory:
```env
DATABASE_URL="file:./dev.db"
PORT=3001
VITE_API_URL="http://localhost:3001"
```
*(If missing, copy `.env.example` to `.env`)*

### 3. Initialize & Seed the Database
Run the single setup command to push the schema and populate initial settings/admin user:
```bash
npm run db:setup
```

### 4. Start the Application
To run **both** the Express API Backend (`http://localhost:3001`) and Vite Frontend (`http://localhost:3000`) simultaneously:
```bash
npm run dev:all
```
*(Or run `npm run server` in terminal 1, and `npm run dev` in terminal 2).*

---

## 🌐 Supabase Cloud PostgreSQL Database Setup

Your Supabase project `yqciwlvmoboszvxzodrl` is configured as the primary cloud database.

### Step 1: Add Your Database Password to `.env`
Open your [.env](file:///c:/Users/Kowsalya/Desktop/My_projects/Multi_business_billing_system/.env) file and replace `[YOUR-PASSWORD]` with your actual Supabase database password:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.yqciwlvmoboszvxzodrl.supabase.co:5432/postgres"
```

### Step 2: Push Schema & Seed Data to Supabase
Run the setup command:
```bash
npm run db:setup
```

### Step 3: Deployment (Vercel / Render / Cloud)
Add `DATABASE_URL` with your password to your Vercel/Render Environment Variables.

### Step 4: Run Deploy Migrations
Run:
```bash
npx prisma db push --schema=prisma/schema.prisma
npx tsx prisma/seed.ts
```

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q1: `Error: Cannot find module '@prisma/client'`
**Fix:** Run `npm run db:generate` or `npx prisma generate` to rebuild Prisma binaries for your current machine architecture.

### Q2: Frontend loads, but saving items or fetching data fails (502 / ECONNREFUSED)
**Fix:** The API server is not running. Make sure you run `npm run dev:all` or start `npm run server` alongside `npm run dev`.

### Q3: `PrismaClientInitializationError: Unable to open database file`
**Fix:** Run `npm run db:setup` to ensure `prisma/dev.db` file permissions and SQLite table definitions are initialized on your filesystem.
