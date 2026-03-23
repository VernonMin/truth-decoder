import { getRequestContext } from '@cloudflare/next-on-pages';
import { queryMbdOrder } from '@/lib/mbd';
import { activatePro, getOrCreateUser } from '@/lib/d1';
import type { Env } from '@/types';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  const { searchParams } = new URL(request.url);
  const sessionId = (searchParams.get('sessionId') ?? '').slice(0, 64);
  if (!sessionId) return Response.json({ error: '缺少 sessionId' }, { status: 400 });

  // 已经是 Pro，直接返回
  const user = await getOrCreateUser(typedEnv.DB, sessionId);
  if (user.isPro) return Response.json({ isPro: true });

  // 向面包多查单
  try {
    const { paid } = await queryMbdOrder({
      apiToken: typedEnv.MBD_API_TOKEN,
      outOrderId: sessionId,
    });

    if (paid) {
      await activatePro(typedEnv.DB, sessionId);
      console.log(`Pro activated via polling: session=${sessionId}`);
      return Response.json({ isPro: true });
    }
  } catch (err) {
    console.error('面包多查单失败:', err);
    // 查单失败不中断轮询，返回未付款
  }

  return Response.json({ isPro: false });
}
