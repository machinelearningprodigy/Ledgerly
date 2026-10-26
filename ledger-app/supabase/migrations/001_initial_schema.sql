-- ============================================================
-- Transaction Ledger — Initial Schema & Security Configuration
-- Run this entire file in your Supabase SQL Editor
-- Project: Cofluencer Assessment (LedgerFlow)
-- ============================================================

-- Enable UUID extension (enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT            NOT NULL CHECK (char_length(trim(name)) > 0),
  balance     NUMERIC(15, 2)  NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

COMMENT ON TABLE  accounts            IS 'Account holders with their current balance';
COMMENT ON COLUMN accounts.id         IS 'Auto-generated UUID primary key';
COMMENT ON COLUMN accounts.name       IS 'Account holder full name — required, non-empty';
COMMENT ON COLUMN accounts.balance    IS 'Current balance — always >= 0, updated atomically with each transaction';
COMMENT ON COLUMN accounts.created_at IS 'System-generated creation timestamp';

CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts (created_at DESC);

-- ============================================================
-- TABLE: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID            NOT NULL REFERENCES accounts (id) ON DELETE RESTRICT,
  type         TEXT            NOT NULL CHECK (type IN ('credit', 'debit')),
  amount       NUMERIC(15, 2)  NOT NULL CHECK (amount > 0),
  description  TEXT            NOT NULL,
  reference_id TEXT            NOT NULL,
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT now(),

  -- Idempotency: reference_id is unique per account
  CONSTRAINT uq_account_reference UNIQUE (account_id, reference_id)
);

COMMENT ON TABLE  transactions                IS 'Immutable transaction log — never updated or deleted via API';
COMMENT ON COLUMN transactions.type           IS 'credit or debit';
COMMENT ON COLUMN transactions.amount         IS 'Always positive; direction is determined by type';
COMMENT ON COLUMN transactions.reference_id   IS 'Client-provided idempotency key — unique per account';

CREATE INDEX IF NOT EXISTS idx_transactions_account_id    ON transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at    ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account_type  ON transactions (account_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_ref           ON transactions (account_id, reference_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Service role full access on accounts" ON accounts;
DROP POLICY IF EXISTS "Service role full access on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow anon read access on accounts" ON accounts;
DROP POLICY IF EXISTS "Allow anon read access on transactions" ON transactions;

-- 1. Service role (used by Next.js API route handlers) has full access
CREATE POLICY "Service role full access on accounts"
  ON accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on transactions"
  ON transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Anon / Public role: Read-only access allowed for inspection.
-- Direct INSERT, UPDATE, and DELETE by anon are strictly disallowed.
-- All state mutations MUST execute through the Next.js API and atomic stored procedures.
CREATE POLICY "Allow anon read access on accounts"
  ON accounts
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access on transactions"
  ON transactions
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- FUNCTION: process_transaction
-- Atomically inserts a transaction and updates account balance.
-- Enforces row-level locks (FOR UPDATE), idempotency, and balance checks.
-- ============================================================
CREATE OR REPLACE FUNCTION process_transaction(
  p_account_id   UUID,
  p_type         TEXT,
  p_amount       NUMERIC,
  p_description  TEXT,
  p_reference_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account      accounts%ROWTYPE;
  v_transaction  transactions%ROWTYPE;
  v_new_balance  NUMERIC;
BEGIN
  -- Lock account row to serialize concurrent transactions
  SELECT * INTO v_account FROM accounts WHERE id = p_account_id FOR UPDATE;

  IF v_account.id IS NULL THEN
    RAISE EXCEPTION 'ACCOUNT_NOT_FOUND: Account % not found', p_account_id;
  END IF;

  -- Check for duplicate reference_id (idempotency key)
  SELECT * INTO v_transaction
  FROM transactions
  WHERE account_id = p_account_id AND reference_id = p_reference_id;

  IF v_transaction.id IS NOT NULL THEN
    RETURN json_build_object(
      'transaction', row_to_json(v_transaction),
      'balance', v_account.balance,
      'duplicate', true
    );
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Amount must be greater than 0';
  END IF;

  IF p_type = 'credit' THEN
    v_new_balance := v_account.balance + p_amount;
  ELSIF p_type = 'debit' THEN
    IF v_account.balance < p_amount THEN
      RAISE EXCEPTION 'INSUFFICIENT_BALANCE: Account balance (%) is less than debit amount (%)',
        v_account.balance, p_amount;
    END IF;
    v_new_balance := v_account.balance - p_amount;
  ELSE
    RAISE EXCEPTION 'VALIDATION_ERROR: type must be credit or debit';
  END IF;

  -- Insert ledger entry
  INSERT INTO transactions (account_id, type, amount, description, reference_id)
  VALUES (p_account_id, p_type, p_amount, p_description, p_reference_id)
  RETURNING * INTO v_transaction;

  -- Update account balance
  UPDATE accounts SET balance = v_new_balance WHERE id = p_account_id;

  RETURN json_build_object(
    'transaction', row_to_json(v_transaction),
    'balance', v_new_balance,
    'duplicate', false
  );
END;
$$;

-- ============================================================
-- FUNCTION: transfer_funds
-- Atomically transfers money between two accounts.
-- Locks accounts in ascending UUID order to prevent cyclic deadlocks.
-- ============================================================
CREATE OR REPLACE FUNCTION transfer_funds(
  p_from_account_id  UUID,
  p_to_account_id    UUID,
  p_amount           NUMERIC,
  p_description      TEXT,
  p_reference_id     TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_account   accounts%ROWTYPE;
  v_to_account     accounts%ROWTYPE;
  v_debit_txn      transactions%ROWTYPE;
  v_credit_txn     transactions%ROWTYPE;
BEGIN
  IF p_from_account_id = p_to_account_id THEN
    RAISE EXCEPTION 'SAME_ACCOUNT: Cannot transfer to the same account';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Transfer amount must be greater than 0';
  END IF;

  -- Lock both accounts in deterministic order to prevent deadlocks
  IF p_from_account_id < p_to_account_id THEN
    SELECT * INTO v_from_account FROM accounts WHERE id = p_from_account_id FOR UPDATE;
    SELECT * INTO v_to_account   FROM accounts WHERE id = p_to_account_id   FOR UPDATE;
  ELSE
    SELECT * INTO v_to_account   FROM accounts WHERE id = p_to_account_id   FOR UPDATE;
    SELECT * INTO v_from_account FROM accounts WHERE id = p_from_account_id FOR UPDATE;
  END IF;

  IF v_from_account.id IS NULL THEN
    RAISE EXCEPTION 'ACCOUNT_NOT_FOUND: Source account not found';
  END IF;
  IF v_to_account.id IS NULL THEN
    RAISE EXCEPTION 'ACCOUNT_NOT_FOUND: Destination account not found';
  END IF;

  IF v_from_account.balance < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_BALANCE: Source account balance (%) is less than transfer amount (%)',
      v_from_account.balance, p_amount;
  END IF;

  -- 1. Debit source
  UPDATE accounts SET balance = balance - p_amount WHERE id = p_from_account_id;
  INSERT INTO transactions (account_id, type, amount, description, reference_id)
    VALUES (p_from_account_id, 'debit', p_amount, p_description, 'DEBIT-' || p_reference_id)
    RETURNING * INTO v_debit_txn;

  -- 2. Credit destination
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_to_account_id;
  INSERT INTO transactions (account_id, type, amount, description, reference_id)
    VALUES (p_to_account_id, 'credit', p_amount, p_description, 'CREDIT-' || p_reference_id)
    RETURNING * INTO v_credit_txn;

  RETURN json_build_object(
    'debit_transaction',  row_to_json(v_debit_txn),
    'credit_transaction', row_to_json(v_credit_txn),
    'from_account_id',    p_from_account_id,
    'to_account_id',      p_to_account_id,
    'amount',             p_amount,
    'from_balance',       (SELECT balance FROM accounts WHERE id = p_from_account_id),
    'to_balance',         (SELECT balance FROM accounts WHERE id = p_to_account_id)
  );
END;
$$;

-- Grant execution rights on functions
GRANT EXECUTE ON FUNCTION process_transaction TO service_role, anon;
GRANT EXECUTE ON FUNCTION transfer_funds TO service_role, anon;

-- ============================================================
-- VIEW: account_summary
-- Optional aggregate view for fast analytics / debugging
-- ============================================================
CREATE OR REPLACE VIEW account_summary AS
SELECT
  a.id,
  a.name,
  a.balance,
  a.created_at,
  COUNT(t.id)                                                 AS total_transactions,
  COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'credit'), 0) AS total_credited,
  COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'debit'),  0) AS total_debited
FROM accounts a
LEFT JOIN transactions t ON t.account_id = a.id
GROUP BY a.id;

COMMENT ON VIEW account_summary IS 'Aggregate view of accounts with transaction totals';
