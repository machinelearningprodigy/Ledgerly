# LedgerFlow — Transaction Ledger API & System

A production-ready, highly reliable **Transaction Ledger API** and dashboard built end-to-end with **Next.js 14 (App Router) + Supabase (PostgreSQL) + TypeScript + Tailwind CSS + shadcn/ui**.

---

## 📁 Key Deliverables

1. **[PRD.md](./PRD.md)**: Product Requirements Document outlining all business logic, requirements, schema, and API contracts.
2. **[ASSUMPTIONS.md](./ASSUMPTIONS.md)**: Design decisions, idempotency architecture, transaction isolation, and currency handling.
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
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

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

## 📖 API Documentation & Reference

### Base URL
```
http://localhost:3000/api
```

### Standard Error Response Format
All errors return a consistent JSON shape:
```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Account balance (50.00) is less than debit amount (100.00)",
    "details": {}
  }
}
```

---

### 1. Create Account
Creates a new account with an initial balance of `0.00`.
- **Method:** `POST`
- **Path:** `/api/accounts`
- **Request Body:**
```json
{
  "name": "Alice Johnson"
}
```
- **Response `201 Created`:**
```json
{
  "data": {
    "id": "e4c5b369-1234-4567-89ab-cdef01234567",
    "name": "Alice Johnson",
    "balance": 0,
    "created_at": "2026-10-26T12:00:00Z"
  }
}
```

---

### 2. List Accounts
Retrieves a paginated list of accounts sorted latest-first.
- **Method:** `GET`
- **Path:** `/api/accounts?page=1&limit=10`
- **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "e4c5b369-1234-4567-89ab-cdef01234567",
      "name": "Alice Johnson",
      "balance": 150.00,
      "created_at": "2026-10-26T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "current_page": 1,
    "limit": 10,
    "page_size": 10,
    "total_records": 1,
    "total_pages": 1
  }
}
```

---

### 3. Get Account Balance & Details
Retrieves details and real-time balance for an account.
- **Method:** `GET`
- **Path:** `/api/accounts/:id`
- **Response `200 OK`:**
```json
{
  "data": {
    "account_id": "e4c5b369-1234-4567-89ab-cdef01234567",
    "id": "e4c5b369-1234-4567-89ab-cdef01234567",
    "name": "Alice Johnson",
    "balance": 150.00,
    "created_at": "2026-10-26T12:00:00Z"
  }
}
```
- **Response `404 Not Found`:** If account does not exist.

---

### 4. Add Transaction (Credit / Debit)
Adds an atomic credit or debit transaction to an account.
- **Method:** `POST`
- **Path:** `/api/accounts/:id/transactions`
- **Request Body:**
```json
{
  "type": "credit",
  "amount": 100.00,
  "description": "Salary deposit",
  "reference_id": "TXN-2024-001"
}
```
- **Response `201 Created`:**
```json
{
  "data": {
    "id": "7a8b9c0d-1122-3344-5566-778899aabbcc",
    "account_id": "e4c5b369-1234-4567-89ab-cdef01234567",
    "type": "credit",
    "amount": 100.00,
    "description": "Salary deposit",
    "reference_id": "TXN-2024-001",
    "created_at": "2026-10-26T12:05:00Z",
    "new_balance": 100.00
  }
}
```
- **Response `200 OK` (Idempotent Duplicate):** If the same `reference_id` is submitted again for the same account:
```json
{
  "data": { "id": "...", "reference_id": "TXN-2024-001", ... },
  "message": "Transaction already exists",
  "duplicate": true
}
```
- **Response `422 Unprocessable Entity` (Insufficient Balance):** If debit amount exceeds balance:
```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Account balance (100.00) is less than debit amount (150.00)"
  }
}
```

---

### 5. Get Transaction History
Retrieves paginated, filtered transactions for an account sorted latest-first.
- **Method:** `GET`
- **Path:** `/api/accounts/:id/transactions?type=credit&page=1&limit=10`
- **Query Parameters:**
  - `type` *(optional)*: `credit` or `debit` (returns all if omitted)
  - `page` *(optional)*: Page number (default: `1`)
  - `limit` *(optional)*: Records per page (default: `10`, max: `100`)
- **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "7a8b9c0d-1122-3344-5566-778899aabbcc",
      "account_id": "e4c5b369-1234-4567-89ab-cdef01234567",
      "type": "credit",
      "amount": 100.00,
      "description": "Salary deposit",
      "reference_id": "TXN-2024-001",
      "created_at": "2026-10-26T12:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "current_page": 1,
    "limit": 10,
    "page_size": 10,
    "total_records": 1,
    "total_pages": 1
  }
}
```

---

### 6. Transfer Funds (Bonus)
Atomically moves funds from a source account to a destination account.
- **Method:** `POST`
- **Path:** `/api/transfers`
- **Request Body:**
```json
{
  "from_account_id": "e4c5b369-1234-4567-89ab-cdef01234567",
  "to_account_id": "f5d6c7e8-2345-6789-01bc-def012345678",
  "amount": 30.00,
  "description": "Rent payment",
  "reference_id": "TRANSFER-001"
}
```
- **Response `201 Created`:**
```json
{
  "data": {
    "debit_transaction": { "id": "...", "type": "debit", "amount": 30.00, ... },
    "credit_transaction": { "id": "...", "type": "credit", "amount": 30.00, ... },
    "from_account_id": "e4c5b369-1234-4567-89ab-cdef01234567",
    "to_account_id": "f5d6c7e8-2345-6789-01bc-def012345678",
    "amount": 30.00,
    "from_balance": 70.00,
    "to_balance": 80.00
  }
}
```

---

## 🛡️ Security & Integrity Highlights

- **Server-Side Exclusivity**: All database mutations (credits, debits, transfers) run through Next.js server Route Handlers using the `SUPABASE_SERVICE_ROLE_KEY`. No raw database writes occur from the browser.
- **Atomicity via Database Locks**: Account updates use PostgreSQL row-level locks (`FOR UPDATE`) inside stored procedures (`process_transaction` and `transfer_funds`), eliminating race conditions and double-spending.
- **Idempotency Guarantee**: A composite unique constraint `UNIQUE (account_id, reference_id)` combined with procedure-level duplicate checks ensures safe retries with zero balance impact.
- **Deadlock-Free Transfers**: Double-entry account locks in transfers are ordered deterministically by UUID (`p_from_account_id < p_to_account_id`), preventing deadlocks under concurrent cross-transfers.
- **Non-Negative Balance Protection**: Hard database check constraint `CHECK (balance >= 0)` ensures an account can never fall into a negative balance.
- **Row Level Security (RLS)**: Enabled on all tables. Anonymous direct writes are blocked.
- **SECURITY DEFINER Functions**: Procedures run with `SET search_path = public` to mitigate search_path injection attacks.
