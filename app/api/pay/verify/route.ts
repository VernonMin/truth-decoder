import { getRequestContext } from '@cloudflare/next-on-pages';
import { getPaySession } from '@/lib/kv';
import type { Env } from '@/types';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') ?? '';

  if (!sessionId) {
    return Response.json({ paid: false }, { status: 400 });
  }

  const session = await getPaySession(typedEnv.PAY_SESSIONS, sessionId);
  return Response.json({ paid: session !== null, paidAt: session?.paidAt ?? null });
}
