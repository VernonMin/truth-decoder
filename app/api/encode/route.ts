import { getRequestContext } from '@cloudflare/next-on-pages';
import { callDeepSeekEncode, type EncodeSector } from '@/lib/gemini';
import type { Env } from '@/types';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  let text: string, sessionId: string, sector: EncodeSector;
  try {
    const body = await request.json() as { text?: string; sessionId?: string; sector?: string };
    text = (body.text ?? '').trim();
    sessionId = (body.sessionId ?? 'anonymous').slice(0, 64);
    sector = (['tech', 'gov', 'mnc'] as EncodeSector[]).includes(body.sector as EncodeSector)
      ? (body.sector as EncodeSector)
      : 'tech';
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 });
  }

  if (!text || text.length > 1000) {
    return Response.json({ error: '输入无效（1-1000字符）' }, { status: 400 });
  }

  let result;
  try {
    result = await callDeepSeekEncode(text, typedEnv.DEEPSEEK_API_KEY, sector);
  } catch (err) {
    console.error('DeepSeek encode error:', err);
    return Response.json({ error: 'AI 服务暂时不可用，请稍后重试' }, { status: 502 });
  }

  return Response.json(result);
}
