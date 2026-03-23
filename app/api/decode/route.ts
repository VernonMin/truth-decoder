import { getRequestContext } from '@cloudflare/next-on-pages';
import { callDeepSeek } from '@/lib/gemini';
import { logDecode, getOrCreateUser, incrementUsageCount, FREE_LIMIT } from '@/lib/d1';
import type { Env } from '@/types';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { env, ctx } = getRequestContext();
  const typedEnv = env as unknown as Env;

  let text: string, sessionId: string;
  try {
    const body = await request.json() as { text?: string; sessionId?: string };
    text = (body.text ?? '').trim();
    sessionId = (body.sessionId ?? 'anonymous').slice(0, 64);
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  if (!text || text.length > 500) {
    return Response.json({ error: '输入无效（1-500字符）' }, { status: 400 });
  }

  const user = await getOrCreateUser(typedEnv.DB, sessionId);
  if (!user.isPro && user.usageCount >= FREE_LIMIT) {
    return Response.json({ error: 'payment_required' }, { status: 402 });
  }

  let result;
  try {
    result = await callDeepSeek(text, typedEnv.DEEPSEEK_API_KEY);
  } catch (err) {
    console.error('DeepSeek error:', err);
    return Response.json({ error: 'AI 服务暂时不可用，请稍后重试' }, { status: 502 });
  }

  ctx.waitUntil(Promise.all([
    incrementUsageCount(typedEnv.DB, sessionId),
    logDecode(typedEnv.DB, sessionId, text, result.puaLevel),
  ]));

  return Response.json(result);
}
