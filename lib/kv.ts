import type { PaySession, BuddyKey } from '@/types';

// ─── Pay Session ────────────────────────────────────────────────

export async function getPaySession(
  kv: KVNamespace,
  sessionId: string
): Promise<PaySession | null> {
  const raw = await kv.get(`pay:${sessionId}`);
  if (!raw) return null;
  return JSON.parse(raw) as PaySession;
}

export async function setPaySession(
  kv: KVNamespace,
  sessionId: string,
  session: PaySession,
  ttlSeconds = 86400
): Promise<void> {
  await kv.put(`pay:${sessionId}`, JSON.stringify(session), {
    expirationTtl: ttlSeconds,
  });
}

// ─── Buddy Key ──────────────────────────────────────────────────

function generateKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混淆字符 0/O/1/I
  let result = 'TK-';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result; // 例如 TK-A3F9KM
}

// 付款成功后，为付款人生成一个 Buddy Key
export async function createBuddyKey(
  kv: KVNamespace,
  ownerSessionId: string,
  ownerName: string
): Promise<BuddyKey> {
  const key = generateKey();
  const buddy: BuddyKey = {
    key,
    ownerSessionId,
    ownerName,
    usedBySessionId: null,
    createdAt: Date.now(),
    usedAt: null,
  };

  // key → buddy 数据，7天有效
  await kv.put(`buddy:${key}`, JSON.stringify(buddy), {
    expirationTtl: 60 * 60 * 24 * 7,
  });

  // owner → key 反查，方便付款人查自己的 key
  await kv.put(`buddy_owner:${ownerSessionId}`, key, {
    expirationTtl: 60 * 60 * 24 * 7,
  });

  return buddy;
}

// 查询 Buddy Key 信息
export async function getBuddyKey(
  kv: KVNamespace,
  key: string
): Promise<BuddyKey | null> {
  const raw = await kv.get(`buddy:${key.toUpperCase()}`);
  if (!raw) return null;
  return JSON.parse(raw) as BuddyKey;
}

// 好友使用 Buddy Key 解锁
// 返回值：'ok' | 'not_found' | 'already_used' | 'self_use'
export async function redeemBuddyKey(
  kv: KVNamespace,
  key: string,
  redeemerSessionId: string
): Promise<'ok' | 'not_found' | 'already_used' | 'self_use'> {
  const buddy = await getBuddyKey(kv, key);

  if (!buddy) return 'not_found';
  if (buddy.usedBySessionId !== null) return 'already_used';
  if (buddy.ownerSessionId === redeemerSessionId) return 'self_use';

  // 标记已使用
  const updated: BuddyKey = {
    ...buddy,
    usedBySessionId: redeemerSessionId,
    usedAt: Date.now(),
  };
  await kv.put(`buddy:${key.toUpperCase()}`, JSON.stringify(updated), {
    expirationTtl: 60 * 60 * 24 * 7,
  });

  // 给好友写一条解锁记录，TTL 24h
  await kv.put(
    `buddy_unlocked:${redeemerSessionId}`,
    JSON.stringify({ key, ownerName: buddy.ownerName, unlockedAt: Date.now() }),
    { expirationTtl: 86400 }
  );

  return 'ok';
}

// 查询某个 session 是否通过 Buddy Key 解锁过
export async function getBuddyUnlock(
  kv: KVNamespace,
  sessionId: string
): Promise<{ key: string; ownerName: string; unlockedAt: number } | null> {
  const raw = await kv.get(`buddy_unlocked:${sessionId}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

// 付款人查自己生成的 Buddy Key
export async function getOwnerBuddyKey(
  kv: KVNamespace,
  ownerSessionId: string
): Promise<BuddyKey | null> {
  const key = await kv.get(`buddy_owner:${ownerSessionId}`);
  if (!key) return null;
  return getBuddyKey(kv, key);
}
