export async function checkRateLimit(
  db: D1Database,
  sessionId: string
): Promise<{ count: number }> {
  const date = new Date().toISOString().slice(0, 10);

  const row = await db
    .prepare('SELECT count FROM daily_usage WHERE session_id = ? AND date = ?')
    .bind(sessionId, date)
    .first<{ count: number }>();

  return { count: row?.count ?? 0 };
}

export async function incrementUsage(db: D1Database, sessionId: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);

  await db
    .prepare(`
      INSERT INTO daily_usage (session_id, date, count) VALUES (?, ?, 1)
      ON CONFLICT(session_id, date) DO UPDATE SET count = count + 1
    `)
    .bind(sessionId, date)
    .run();
}

export async function logDecode(
  db: D1Database,
  sessionId: string,
  inputText: string,
  puaLevel: number
): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const text = inputText.slice(0, 100); // 榜单只取前100字

  await Promise.all([
    db.prepare(
      'INSERT INTO decode_logs (session_id, input_text, pua_level) VALUES (?, ?, ?)'
    ).bind(sessionId, inputText.slice(0, 500), puaLevel).run(),

    // 同步写入热榜统计
    db.prepare(`
      INSERT INTO jargon_stats (date, input_text, pua_level, decode_count)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(date, input_text) DO UPDATE SET
        decode_count = decode_count + 1,
        pua_level = excluded.pua_level
    `).bind(date, text, puaLevel).run(),
  ]);
}

export interface RankItem {
  input_text: string;
  pua_level: number;
  decode_count: number;
  like_count: number;
}

// 获取今日热榜 Top N
export async function getDailyRanking(
  db: D1Database,
  limit = 10
): Promise<RankItem[]> {
  const date = new Date().toISOString().slice(0, 10);

  const { results } = await db
    .prepare(`
      SELECT input_text, pua_level, decode_count, like_count
      FROM jargon_stats
      WHERE date = ?
      ORDER BY (decode_count + like_count * 2) DESC
      LIMIT ?
    `)
    .bind(date, limit)
    .all<RankItem>();

  return results;
}

// 点赞，返回最新 like_count，重复点赞返回 null
export async function likeJargon(
  db: D1Database,
  sessionId: string,
  inputText: string
): Promise<number | null> {
  const date = new Date().toISOString().slice(0, 10);
  const text = inputText.slice(0, 100);

  // 防重复点赞
  const exists = await db
    .prepare('SELECT 1 FROM jargon_likes WHERE session_id=? AND date=? AND input_text=?')
    .bind(sessionId, date, text)
    .first();
  if (exists) return null;

  await db.batch([
    db.prepare(
      'INSERT INTO jargon_likes (session_id, date, input_text) VALUES (?, ?, ?)'
    ).bind(sessionId, date, text),
    db.prepare(`
      UPDATE jargon_stats SET like_count = like_count + 1
      WHERE date = ? AND input_text = ?
    `).bind(date, text),
  ]);

  const row = await db
    .prepare('SELECT like_count FROM jargon_stats WHERE date=? AND input_text=?')
    .bind(date, text)
    .first<{ like_count: number }>();

  return row?.like_count ?? 0;
}

// ── 用户权限 ────────────────────────────────────────────────

export const FREE_LIMIT = 1000;

export interface UserStatus {
  usageCount: number;
  isPro: boolean;
}

export async function getOrCreateUser(db: D1Database, sessionId: string): Promise<UserStatus> {
  await db.prepare('INSERT OR IGNORE INTO users (session_id) VALUES (?)').bind(sessionId).run();
  const row = await db
    .prepare('SELECT usage_count, is_pro FROM users WHERE session_id = ?')
    .bind(sessionId)
    .first<{ usage_count: number; is_pro: number }>();
  return { usageCount: row?.usage_count ?? 0, isPro: (row?.is_pro ?? 0) === 1 };
}

export async function incrementUsageCount(db: D1Database, sessionId: string): Promise<void> {
  await db
    .prepare('UPDATE users SET usage_count = usage_count + 1 WHERE session_id = ?')
    .bind(sessionId)
    .run();
}

export async function activatePro(db: D1Database, sessionId: string): Promise<void> {
  await db
    .prepare(`
      INSERT INTO users (session_id, is_pro, paid_at) VALUES (?, 1, ?)
      ON CONFLICT(session_id) DO UPDATE SET is_pro = 1, paid_at = excluded.paid_at
    `)
    .bind(sessionId, new Date().toISOString())
    .run();
}

