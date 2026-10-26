# Transaction Ledger System — Cofluencer Assessment

A production-grade, highly reliable **Transaction Ledger API** and dashboard built end-to-end with **Next.js 14 (App Router) + Supabase (PostgreSQL) + TypeScript + Tailwind CSS + shadcn/ui**.

---

## 📁 Key Deliverables

1. **[PRD.md](./PRD.md)**: Product Requirements Document outlining all business logic, requirements, schema, and API contracts.
2. **[ASSUMPTIONS.md](./ledger-app/ASSUMPTIONS.md)**: Design decisions, idempotency architecture, transaction isolation, and currency handling.
3. **[Database Schema & Migration](./ledger-app/supabase/migrations/001_initial_schema.sql)**: Complete PostgreSQL schema with table definitions, check constraints, row-level locking, and atomic stored procedures (`process_transaction` & `transfer_funds`).
4. **[Source Code](./ledger-app/)**: Complete Next.js application containing backend Route Handlers and frontend dashboard.

---

## 🚀 Quick Setup & Run

The application is located in the `ledger-app` directory.

### 1. Database Setup (Supabase)
1. Create a free project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy & paste the entire contents of [`ledger-app/supabase/migrations/001_initial_schema.sql`](./ledger-app/supabase/migrations/001_initial_schema.sql) and click **Run**.
4. Retrieve your Project URL and API Keys under **Project Settings → API**:
   - `Project URL`
   - `anon` key
   - `service_role` secret key

### 2. Configure Environment
In `ledger-app`:
```bash
cd ledger-app
cp .env.local.example .env.local
```
Fill in the values in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Install & Start
```bash
pnpm install
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛡️ Security & Integrity Highlights

- **Server-Side Exclusivity**: All database mutations (credits, debits, transfers) run through Next.js server Route Handlers using the `SUPABASE_SERVICE_ROLE_KEY`. No raw database writes occur from the browser.
- **Atomicity via Database Locks**: Account updates use PostgreSQL row-level locks (`FOR UPDATE`) inside stored procedures (`process_transaction` and `transfer_funds`), eliminating race conditions and double-spending.
- **Idempotency Guarantee**: A composite unique constraint `UNIQUE (account_id, reference_id)` combined with procedure-level duplicate checks ensures safe retries with zero balance impact.
- **Deadlock-Free Transfers**: Double-entry account locks in transfers are ordered deterministically by UUID (`p_from_account_id < p_to_account_id`), preventing deadlocks under concurrent cross-transfers.
- **Non-Negative Balance Protection**: Hard database check constraint `CHECK (balance >= 0)` ensures an account can never fall into a negative balance.
