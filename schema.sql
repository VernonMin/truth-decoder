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

-- 每日黑话热榜：按天聚合翻译次数 + 点赞数
CREATE TABLE IF NOT EXISTS jargon_stats (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL,              -- YYYY-MM-DD
  input_text  TEXT    NOT NULL,
  pua_level   INTEGER NOT NULL DEFAULT 0,
  decode_count INTEGER NOT NULL DEFAULT 1,  -- 被翻译次数
  like_count  INTEGER NOT NULL DEFAULT 0,   -- 点赞数
  UNIQUE(date, input_text)
);

-- 防止同一 session 重复点赞
CREATE TABLE IF NOT EXISTS jargon_likes (
  session_id  TEXT NOT NULL,
  date        TEXT NOT NULL,
  input_text  TEXT NOT NULL,
  PRIMARY KEY (session_id, date, input_text)
);

CREATE INDEX IF NOT EXISTS idx_decode_logs_session ON decode_logs(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_records_session ON payment_records(session_id);
CREATE INDEX IF NOT EXISTS idx_jargon_stats_date ON jargon_stats(date, decode_count DESC);

