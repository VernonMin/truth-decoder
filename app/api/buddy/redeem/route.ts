import { getRequestContext } from '@cloudflare/next-on-pages';
import { redeemBuddyKey } from '@/lib/kv';
import type { Env } from '@/types';

export const runtime = 'edge';

// POST /api/buddy/redeem
// 好友输入 Buddy Key 解锁
export async function POST(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  const { key, sessionId } = await request.json() as {
    key?: string;
    sessionId?: string;
  };

  if (!key || !sessionId) {
    return Response.json({ error: '缺少参数' }, { status: 400 });
  }

  const result = await redeemBuddyKey(typedEnv.PAY_SESSIONS, key.trim(), sessionId);

  const messages: Record<string, string> = {
    ok: '解锁成功！你的好友帮你逃出了 PUA 陷阱',
    not_found: '无效的真相码，请检查是否输入正确',
    already_used: '这个真相码已经被用过了',
    self_use: '不能使用自己的真相码',
  };

  return Response.json(
    { success: result === 'ok', message: messages[result] },
    { status: result === 'ok' ? 200 : 400 }
  );
}
