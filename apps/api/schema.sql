-- SQLite schema for the dashboard API. Amounts are numeric SEK values in this case study.
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  organization_number TEXT NOT NULL UNIQUE
);

-- The case study shows one card per company; revisit if multiple cards are required.
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL UNIQUE REFERENCES companies(id),
  status TEXT NOT NULL CHECK (status IN ('inactive', 'active', 'blocked')),
  label TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('visa', 'mastercard')),
  last_four TEXT NOT NULL CHECK (length(last_four) = 4 AND last_four NOT GLOB '*[^0-9]*'),
  logo_url TEXT
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  invoice_number TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency = 'SEK'),
  due_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid')),
  UNIQUE (company_id, invoice_number)
);
CREATE INDEX invoices_due_idx ON invoices(company_id, status, due_date);

CREATE TABLE spend_limits (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency = 'SEK'),
  CHECK (period_end >= period_start),
  UNIQUE (company_id, period_start)
);

-- Stored timestamps are normalized to UTC ISO strings so the index orders them by time.
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  merchant TEXT NOT NULL,
  merchant_logo_url TEXT,
  occurred_at TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency = 'SEK')
);
CREATE INDEX transactions_recent_idx ON transactions(company_id, occurred_at DESC, id DESC);
