import { getRequestContext } from '@cloudflare/next-on-pages';
import { verifyMianbaoduo } from '@/lib/payment';
import { setPaySession } from '@/lib/kv';
import type { Env, PaySession } from '@/types';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  const body = await request.text();
  const params = new URLSearchParams(body);

  const isValid = await verifyMianbaoduo(params, typedEnv.MIANBAODUO_WEBHOOK_SECRET);
  if (!isValid) {
    return new Response('INVALID_SIGNATURE', { status: 401 });
  }

  const orderId = params.get('trade_no') ?? '';
  const sessionId = params.get('custom') ?? '';
  const tradeStatus = params.get('trade_status');
  const totalFee = Number(params.get('total_fee') ?? 0);

  if (tradeStatus === 'TRADE_SUCCESS' && orderId && sessionId) {
    const session: PaySession = { orderId, paidAt: Date.now() };

    await setPaySession(typedEnv.PAY_SESSIONS, sessionId, session);

    await typedEnv.DB.prepare(
      `INSERT OR REPLACE INTO payment_records (order_id, session_id, amount, status, paid_at)
       VALUES (?, ?, ?, 'paid', datetime('now'))`
    )
      .bind(orderId, sessionId, totalFee)
      .run();
  }

  return new Response('success');
}
