import { getRequestContext } from '@cloudflare/next-on-pages';
import { buildPayUrl } from '@/lib/mbd';
import type { Env } from '@/types';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  let sessionId: string;
  try {
    const body = await request.json() as { sessionId?: string };
    sessionId = (body.sessionId ?? '').slice(0, 64);
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  if (!sessionId) return Response.json({ error: '缺少 sessionId' }, { status: 400 });
  if (!typedEnv.MBD_PRODUCT_URL) return Response.json({ error: '支付未配置' }, { status: 503 });

  const payUrl = buildPayUrl(typedEnv.MBD_PRODUCT_URL, sessionId);
  return Response.json({ payUrl });
}
