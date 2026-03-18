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
  await db
    .prepare(
      'INSERT INTO decode_logs (session_id, input_text, pua_level) VALUES (?, ?, ?)'
    )
    .bind(sessionId, inputText.slice(0, 500), puaLevel)
    .run();
}
