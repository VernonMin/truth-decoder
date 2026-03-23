import { getRequestContext } from '@cloudflare/next-on-pages';
import { getOrCreateUser, FREE_LIMIT } from '@/lib/d1';
import type { Env } from '@/types';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;
  const { searchParams } = new URL(request.url);
  const sessionId = (searchParams.get('sessionId') ?? 'anonymous').slice(0, 64);

  const { usageCount, isPro } = await getOrCreateUser(typedEnv.DB, sessionId);
  return Response.json({ usageCount, isPro, freeLimit: FREE_LIMIT });
}
