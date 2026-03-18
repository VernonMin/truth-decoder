import { getRequestContext } from '@cloudflare/next-on-pages';
import { getBuddyUnlock, getOwnerBuddyKey } from '@/lib/kv';
import type { Env } from '@/types';

export const runtime = 'edge';

// GET /api/buddy/status?sessionId=xxx
// 查询当前 session 的 buddy 状态：
//   - 是否通过 Buddy Key 解锁（好友身份）
//   - 是否有自己生成的 Buddy Key（付款人身份）
export async function GET(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') ?? '';

  if (!sessionId) {
    return Response.json({ error: '缺少 sessionId' }, { status: 400 });
  }

  const [unlocked, ownedKey] = await Promise.all([
    getBuddyUnlock(typedEnv.PAY_SESSIONS, sessionId),
    getOwnerBuddyKey(typedEnv.PAY_SESSIONS, sessionId),
  ]);

  return Response.json({
    // 好友身份：是否通过别人的 key 解锁
    unlockedByBuddy: unlocked !== null,
    referrerName: unlocked?.ownerName ?? null,
    // 付款人身份：自己的 Buddy Key 信息
    ownBuddyKey: ownedKey
      ? {
          key: ownedKey.key,
          used: ownedKey.usedBySessionId !== null,
          usedAt: ownedKey.usedAt,
        }
      : null,
  });
}
