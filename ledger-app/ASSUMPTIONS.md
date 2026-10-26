# Assumptions

This document captures all design decisions and assumptions made during development.

---

## 1. Balance Storage
- Balances are stored as `NUMERIC(15,2)` in PostgreSQL — **no floating point errors**
- All arithmetic is done in the database, not in JavaScript, to avoid JS float imprecision

## 2. reference_id Scoping
- `reference_id` uniqueness is enforced **per account**, not globally
- The same `reference_id` (e.g. `"TXN-001"`) can exist across different accounts
- This matches real-world payment idempotency patterns (e.g. Stripe's idempotency keys)

## 3. Duplicate / Idempotency Handling
- If a transaction with the same `(account_id, reference_id)` pair is submitted again:
  - **No new transaction is created**
  - **Account balance is not changed**
  - API returns HTTP 200 with `"duplicate": true` and the original transaction
- This is the safest pattern for payment APIs (safe retries)

## 4. Transaction Immutability
- Transactions cannot be updated or deleted via the API (no PUT/PATCH/DELETE endpoints)
- This is enforced at the API layer; DB-level triggers can be added for extra protection

## 5. Atomicity
- Credit/debit operations use a Postgres stored procedure (`process_transaction`) that:
  - Acquires a row-level lock on the account with `FOR UPDATE`
  - Checks idempotency
  - Validates balance (for debit)
  - Inserts the transaction
  - Updates the balance
  - All within a single database transaction
- This guarantees atomicity even under concurrent requests

## 6. Transfer Atomicity
- Transfers use `transfer_funds` Postgres RPC:
  - Locks both accounts in **consistent UUID sort order** to prevent deadlocks
  - Debits source and credits destination in the same DB transaction
  - Partial transfers are impossible — both operations succeed or both fail

## 7. Authentication
- **No authentication** is implemented — out of scope per assignment brief
- In production, Supabase RLS (Row Level Security) + JWT auth would be added

## 8. Pagination
- Default: `page=1`, `limit=10`
- Maximum allowed `limit`: `100`
- Transactions are always sorted **latest-first** (`created_at DESC`)
- If `page` or `limit` are invalid (non-integer, < 1, > 100), a 400 validation error is returned

## 9. Amount Precision
- Amounts accept up to 2 decimal places
- Stored as `NUMERIC(15,2)` — supports balances up to 9,999,999,999,999.99

## 10. Currency
- UI displays values in **INR (₹)** using `en-IN` locale formatting
- The API itself is currency-agnostic (stores raw numbers)
- Currency can be changed by updating `formatCurrency()` in `src/lib/utils.ts`

## 11. Error Responses
- All API errors follow the same JSON shape: `{ error: { code, message, details? } }`
- HTTP status codes follow REST conventions (400, 404, 409, 422, 500)
- Server-side errors are logged but stack traces are never exposed to the client

## 12. Transfer reference_id
- For a transfer with `reference_id: "T001"`, the system creates:
  - A debit on the source with `reference_id: "DEBIT-T001"`
  - A credit on the destination with `reference_id: "CREDIT-T001"`
- This ensures idempotency at the transfer level while keeping individual transactions unique

## 13. Client Cannot Set Balance
- The `balance` field is excluded from the account creation endpoint
- Any `balance` in the request body is silently ignored (not an error, but not applied)
- Initial balance is always `0` as enforced by the DB default

## 14. Supabase Client Strategy
- **Server routes** use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS, full access)
- **Browser components** use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (respects RLS)
- No direct DB queries from the browser — all mutations go through API routes
