-- D1 Schema for truth-decoder
-- Run: npm run db:migrate

CREATE TABLE IF NOT EXISTS decode_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT    NOT NULL,
  input_text  TEXT    NOT NULL,
  pua_level   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  ip_hash     TEXT
);

CREATE TABLE IF NOT EXISTS daily_usage (
  session_id  TEXT NOT NULL,
  date        TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, date)
);

CREATE TABLE IF NOT EXISTS payment_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    TEXT    NOT NULL UNIQUE,
  session_id  TEXT    NOT NULL,
  amount      INTEGER NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending',
  paid_at     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_decode_logs_session ON decode_logs(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_records_session ON payment_records(session_id);
