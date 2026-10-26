# Assumptions & Architectural Decisions

This document captures all design decisions and assumptions made during development.

---

## 1. Balance Storage & Precision
- Balances are stored as `NUMERIC(15,2)` in PostgreSQL — avoiding IEEE 754 floating point rounding errors.
- All balance updates occur within atomic database procedures (`process_transaction` & `transfer_funds`) rather than in JavaScript memory.

## 2. Idempotency & Reference ID Scoping
- `reference_id` uniqueness is scoped **per account**, not globally.
- The same `reference_id` (e.g. `TXN-001`) can exist across different accounts.
- If a duplicate `(account_id, reference_id)` is submitted:
  - **No new transaction is created**
  - **Account balance is unchanged**
  - API returns HTTP 200 with `"duplicate": true` and the existing transaction record.
- This adheres to standard payment idempotency protocols (such as Stripe / Adyen).

## 3. Transaction Immutability
- Transactions cannot be edited or deleted through the API.
- Once committed to the `transactions` ledger, records are permanent.

## 4. Race Condition & Concurrency Defense
- Transactions acquire an exclusive row-level lock on the account record using `SELECT ... FOR UPDATE`.
- Concurrent transactions on the same account are serialized at the database engine level, preventing race-condition overdraws.

## 5. Atomic Double-Entry Transfers (Bonus)
- Money transfers between Account A and Account B are executed inside `transfer_funds()`:
  - Both accounts are locked in consistent ascending UUID order (`p_from_account_id < p_to_account_id`), preventing cyclic deadlock conditions.
  - Source debit and destination credit occur in the same database transaction.
  - If either account is missing or has insufficient balance, the entire transfer rolls back immediately.

## 6. Security Flow & Key Segregation
- **Server-Side API Routes Only**: The client UI communicates solely with Next.js Route Handlers (`/api/*`).
- **Secret Key Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is loaded exclusively inside server-side Node.js environment and is never bundled into client scripts.
- **Input Sanitization**: All incoming payloads and query parameters are parsed and strictly validated using Zod schemas before touching any business logic.

## 7. Pagination & Ordering
- Default pagination: `page = 1`, `limit = 10` (maximum limit: 100).
- All transaction histories are returned sorted by `created_at DESC` (latest-first).
