# 📋 Product Requirements Document (PRD)
## Transaction Ledger API — Cofluencer Assessment

> **Version:** 1.0.0 | **Date:** 2026-10-26 | **Stack:** Next.js 14 (App Router) + Supabase (PostgreSQL)

---

## 1. Executive Summary

Build a production-ready **Transaction Ledger API** with a minimal, polished UI that allows users to:
- Create accounts with zero initial balance
- Perform atomic credit/debit transactions with duplicate detection
- Retrieve real-time account balances
- Browse paginated, filterable, sorted transaction history
- (Bonus) Transfer funds atomically between accounts

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, API routes, SSR, production-ready |
| Database | Supabase (PostgreSQL) | Managed Postgres, Row-Level Security, real-time, free tier |
| ORM / DB Client | Supabase JS SDK + Raw SQL | Type-safe, supports transactions & stored procedures |
| Validation | Zod | Schema-first, composable, excellent error messages |
| UI | Tailwind CSS + shadcn/ui | Minimal, professional, accessible |
| Language | TypeScript | Type safety end-to-end |
| API Style | REST (Next.js Route Handlers) | Simple, well-understood, HTTP-native |

---

## 3. Database Schema

### 3.1 `accounts` Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | Auto-generated unique ID |
| `name` | `text` | NOT NULL, CHECK (length > 0) | Account holder name |
| `balance` | `numeric(15,2)` | NOT NULL, DEFAULT 0, CHECK (>= 0) | Current balance — always >= 0 |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | System-generated |

### 3.2 `transactions` Table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | Auto-generated |
| `account_id` | `uuid` | NOT NULL, FK → accounts(id) | Referenced account |
| `type` | `text` | NOT NULL, CHECK IN ('credit','debit') | Transaction type |
| `amount` | `numeric(15,2)` | NOT NULL, CHECK (> 0) | Always positive |
| `description` | `text` | NOT NULL | Human-readable note |
| `reference_id` | `text` | NOT NULL | Idempotency key per account |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | System-generated |

**Unique constraint:** `(account_id, reference_id)` — enforces idempotency at DB level.

---

## 4. API Endpoints

### 4.1 Accounts

| Method | Path | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/accounts` | Create a new account | 201, 400, 409 |
| `GET` | `/api/accounts` | List all accounts (paginated) | 200, 400 |
| `GET` | `/api/accounts/:id` | Get account details + balance | 200, 404 |

### 4.2 Transactions

| Method | Path | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/accounts/:id/transactions` | Add credit or debit transaction | 201, 200 (dupe), 400, 404, 409, 422 |
| `GET` | `/api/accounts/:id/transactions` | Get paginated transaction history | 200, 400, 404 |

### 4.3 Bonus — Transfer

| Method | Path | Description | Status Codes |
|---|---|---|---|
| `POST` | `/api/transfers` | Atomic transfer between accounts | 201, 400, 404, 422 |

---

## 5. Request / Response Schemas

### POST /api/accounts
```json
// Request
{ "name": "Alice Johnson" }

// Response 201
{
  "data": {
    "id": "uuid",
    "name": "Alice Johnson",
    "balance": 0,
    "created_at": "2026-10-26T11:00:00Z"
  }
}
```

### POST /api/accounts/:id/transactions
```json
// Request
{
  "type": "credit",
  "amount": 100.00,
  "description": "Salary deposit",
  "reference_id": "TXN-001"
}

// Response 201 (created)
{
  "data": {
    "id": "uuid",
    "account_id": "uuid",
    "type": "credit",
    "amount": 100.00,
    "description": "Salary deposit",
    "reference_id": "TXN-001",
    "created_at": "...",
    "new_balance": 100.00
  }
}

// Response 200 (duplicate — idempotent)
{
  "data": { ...existing transaction... },
  "message": "Transaction already exists",
  "duplicate": true
}
```

### GET /api/accounts/:id/transactions
```
?type=credit|debit    (optional filter)
?page=1               (default 1)
?limit=10             (default 10, max 100)
```
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_records": 42,
    "total_pages": 5
  }
}
```

### POST /api/transfers
```json
// Request
{
  "from_account_id": "uuid",
  "to_account_id": "uuid",
  "amount": 30.00,
  "description": "Rent payment",
  "reference_id": "TRANSFER-001"
}
```

---

## 6. Business Rules

### 6.1 Account Creation
- `name` is required and non-empty
- `balance` is always initialized to `0` (client cannot set it)
- `id` and `created_at` are system-generated

### 6.2 Transaction Rules
- `amount` must be > 0
- `type` must be `credit` or `debit`
- `reference_id` must be provided
- **Credit**: balance += amount (always succeeds if valid)
- **Debit**: balance -= amount (rejected if balance < amount)
- **Duplicate**: same `(account_id, reference_id)` → return existing, no side effects
- Updating balance + inserting transaction is **atomic** (Postgres transaction / RPC)

### 6.3 Transfer Rules (Bonus)
- Both `from_account_id` and `to_account_id` must exist
- They must be different accounts
- Source must have sufficient balance
- Debit + Credit happen atomically in a Postgres stored procedure
- Partial transfers are impossible

### 6.4 Data Integrity
- Transactions are **immutable** (no UPDATE/DELETE endpoints)
- Balance always reflects sum of all committed transactions
- DB-level constraints enforce non-negative balance and valid types

---

## 7. Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Account balance (70.00) is less than debit amount (150.00)",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP | Trigger |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `ACCOUNT_NOT_FOUND` | 404 | Account ID doesn't exist |
| `INSUFFICIENT_BALANCE` | 422 | Debit > current balance |
| `DUPLICATE_TRANSACTION` | 200 | Same reference_id for same account |
| `INVALID_TRANSFER` | 400 | Same account transfer, etc. |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 8. Project Structure

```
cofluencer-ledger/
├── PRD.md
├── README.md
├── ASSUMPTIONS.md
├── .env.local.example
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      ← Full schema + constraints + indexes
│   └── functions/
│       └── transfer_funds.sql           ← Stored procedure for atomic transfer
├── src/
│   ├── app/
│   │   ├── layout.tsx                   ← Root layout + providers
│   │   ├── page.tsx                     ← Dashboard UI
│   │   ├── accounts/
│   │   │   └── [id]/
│   │   │       └── page.tsx             ← Account detail UI
│   │   └── api/
│   │       ├── accounts/
│   │       │   ├── route.ts             ← GET /accounts, POST /accounts
│   │       │   └── [id]/
│   │       │       ├── route.ts         ← GET /accounts/:id
│   │       │       └── transactions/
│   │       │           └── route.ts     ← GET + POST /accounts/:id/transactions
│   │       └── transfers/
│   │           └── route.ts             ← POST /transfers
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               ← Browser client
│   │   │   └── server.ts               ← Server client
│   │   ├── validations/
│   │   │   ├── account.ts              ← Zod schemas for accounts
│   │   │   └── transaction.ts          ← Zod schemas for transactions
│   │   ├── errors.ts                    ← Error classes + formatter
│   │   └── utils.ts                     ← Helpers
│   ├── types/
│   │   └── index.ts                    ← TypeScript interfaces
│   └── components/
│       ├── ui/                          ← shadcn/ui base components
│       ├── accounts/
│       │   ├── AccountCard.tsx
│       │   ├── CreateAccountModal.tsx
│       │   └── AccountList.tsx
│       └── transactions/
│           ├── TransactionTable.tsx
│           ├── AddTransactionModal.tsx
│           └── TransferModal.tsx
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Response time | < 200ms for all API calls |
| Atomicity | All balance updates use Postgres transactions |
| Type safety | Full TypeScript, Zod at boundaries |
| Error handling | Consistent error format, no stack traces in prod |
| Security | Env vars for credentials, no client-side DB access |
| Code quality | ESLint, consistent naming, comments |

---

## 10. Assumptions

See [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) for full list.

Key assumptions:
- Balances stored as `NUMERIC(15,2)` (2 decimal precision, no floating point errors)
- `reference_id` uniqueness is scoped per account (same ref_id can exist across accounts)
- Transaction history is immutable — no soft-delete or edit
- No authentication required (out of scope per assignment)
- Pagination defaults: page=1, limit=10, max limit=100
- The UI is a nice-to-have demo dashboard (API is the primary deliverable)
