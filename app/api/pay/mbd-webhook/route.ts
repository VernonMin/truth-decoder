import { getRequestContext } from '@cloudflare/next-on-pages';
import { activatePro } from '@/lib/d1';
import type { Env } from '@/types';

export const runtime = 'edge';

interface MbdWebhookBody {
  order_id: string;
  out_order_id?: string | null;
  product_name?: string;
  product_url_key?: string;
  amount?: number;
  state: number; // 1 = 支付成功
}

export async function POST(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  let body: MbdWebhookBody;
  try {
    body = await request.json() as MbdWebhookBody;
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  // 只处理支付成功事件
  if (body.state !== 1) {
    return Response.json({ success: true });
  }

  const sessionId = (body.out_order_id ?? '').trim();
  if (!sessionId) {
    console.warn('面包多 webhook: 空 out_order_id，忽略');
    return Response.json({ success: true });
  }

  await activatePro(typedEnv.DB, sessionId);
  console.log(`Pro activated via webhook: session=${sessionId}, order=${body.order_id}`);

  return Response.json({ success: true });
}
