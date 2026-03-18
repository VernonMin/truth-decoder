import { getRequestContext } from '@cloudflare/next-on-pages';
import { createBuddyKey, getOwnerBuddyKey } from '@/lib/kv';
import { getPaySession } from '@/lib/kv';
import type { Env } from '@/types';

export const runtime = 'edge';

// POST /api/buddy/create
// 付款成功后调用，为付款人生成 Buddy Key
export async function POST(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  const { sessionId, ownerName } = await request.json() as {
    sessionId?: string;
    ownerName?: string;
  };

  if (!sessionId) {
    return Response.json({ error: '缺少 sessionId' }, { status: 400 });
  }

  // 必须是已付款用户才能生成
  const paid = await getPaySession(typedEnv.PAY_SESSIONS, sessionId);
  if (!paid) {
    return Response.json({ error: '未找到支付记录' }, { status: 403 });
  }

  // 如果已经生成过，直接返回已有的
  const existing = await getOwnerBuddyKey(typedEnv.PAY_SESSIONS, sessionId);
  if (existing) {
    return Response.json({ key: existing.key, alreadyExisted: true });
  }

  const buddy = await createBuddyKey(
    typedEnv.PAY_SESSIONS,
    sessionId,
    (ownerName ?? '匿名打工人').slice(0, 20)
  );

  return Response.json({ key: buddy.key });
}
