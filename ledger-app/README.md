# LedgerFlow — Transaction Ledger API

A production-ready **Transaction Ledger API** built with **Next.js 14 + Supabase (PostgreSQL)**. Supports creating accounts, atomic credit/debit transactions, idempotency, pagination, filtering, and atomic fund transfers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Validation | Zod |
| UI | Tailwind CSS + shadcn/ui |
| Language | TypeScript |

---

## Quick Start

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Once created, go to **SQL Editor**
3. Copy the entire contents of [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) and run it
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Fill in your Supabase credentials in .env.local
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Error Format (all errors)
```json
{
  "error": {
    "code": "ACCOUNT_NOT_FOUND",
    "message": "Account with id 'xyz' not found",
    "details": {}
  }
}
```

---

### 1. Create Account
```
POST /api/accounts
```
**Request:**
```json
{ "name": "Alice Johnson" }
```
**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Alice Johnson",
    "balance": 0,
    "created_at": "2026-10-26T11:00:00Z"
  }
}
```

---

### 2. List Accounts
```
GET /api/accounts?page=1&limit=10
```
**Response 200:**
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total_records": 42, "total_pages": 5 }
}
```

---

### 3. Get Account
```
GET /api/accounts/:id
```
**Response 200 / 404**

---

### 4. Add Transaction
```
POST /api/accounts/:id/transactions
```
**Request:**
```json
{
  "type": "credit",
  "amount": 100.00,
  "description": "Salary deposit",
  "reference_id": "TXN-2024-001"
}
```
**Response 201** (new) or **200** (duplicate — idempotent):
```json
{
  "data": { ...transaction, "new_balance": 100.00 },
  "duplicate": false
}
```

| Code | Reason |
|---|---|
| 201 | Transaction created |
| 200 | Duplicate reference_id — idempotent response |
| 400 | Validation error |
| 404 | Account not found |
| 422 | Insufficient balance |

---

### 5. List Transactions
```
GET /api/accounts/:id/transactions?type=credit&page=1&limit=10
```
Sorted **latest-first**. Supports `type=credit|debit` filter.

**Response 200:**
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total_records": 5, "total_pages": 1 }
}
```

---

### 6. Transfer Funds (Bonus)
```
POST /api/transfers
```
**Request:**
```json
{
  "from_account_id": "uuid-a",
  "to_account_id":   "uuid-b",
  "amount":          30.00,
  "description":     "Rent payment",
  "reference_id":    "TRANSFER-001"
}
```
**Response 201:**
```json
{
  "data": {
    "debit_transaction":  {...},
    "credit_transaction": {...},
    "from_balance": 70.00,
    "to_balance":   80.00
  }
}
```

---

## Project Structure

```
ledger-app/
├── supabase/migrations/001_initial_schema.sql
├── src/
│   ├── app/api/
│   │   ├── accounts/route.ts
│   │   ├── accounts/[id]/route.ts
│   │   ├── accounts/[id]/transactions/route.ts
│   │   └── transfers/route.ts
│   ├── app/accounts/[id]/page.tsx
│   ├── app/page.tsx
│   ├── components/accounts/CreateAccountModal.tsx
│   ├── components/transactions/AddTransactionModal.tsx
│   ├── components/transactions/TransferModal.tsx
│   ├── lib/supabase/server.ts
│   ├── lib/supabase/client.ts
│   ├── lib/validations/
│   ├── lib/errors.ts
│   └── types/index.ts
├── .env.local.example
├── PRD.md
└── ASSUMPTIONS.md
```

---

## Security Notes

- All DB writes go through **server-side API routes** — the browser never has direct DB access
- `SUPABASE_SERVICE_ROLE_KEY` is only used server-side (never exposed to client)
- Balance updates use **Postgres stored procedures** with row-level locking
- Deadlocks are prevented by locking accounts in **consistent UUID order** in transfers

---

## Data Integrity Guarantees

| Guarantee | Implementation |
|---|---|
| Atomic balance updates | `process_transaction` Postgres RPC |
| Idempotent transactions | `UNIQUE(account_id, reference_id)` DB constraint |
| Non-negative balance | `CHECK (balance >= 0)` DB constraint |
| Immutable transactions | No UPDATE/DELETE endpoints |
| Deadlock-free transfers | Accounts locked in UUID order in `transfer_funds` RPC |
