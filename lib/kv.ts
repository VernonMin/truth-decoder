import type { PaySession } from '@/types';

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
