import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDailyRanking, likeJargon } from '@/lib/d1';
import type { Env } from '@/types';

export const runtime = 'edge';

// GET /api/ranking — 获取今日热榜
export async function GET() {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  const items = await getDailyRanking(typedEnv.DB, 10);
  return Response.json({ items });
}

// POST /api/ranking — 点赞
export async function POST(request: Request) {
  const { env } = getRequestContext();
  const typedEnv = env as unknown as Env;

  const { sessionId, inputText } = await request.json() as {
    sessionId?: string;
    inputText?: string;
  };

  if (!sessionId || !inputText) {
    return Response.json({ error: '缺少参数' }, { status: 400 });
  }

  const likeCount = await likeJargon(typedEnv.DB, sessionId, inputText);

  if (likeCount === null) {
    return Response.json({ error: '已经点过赞了', alreadyLiked: true }, { status: 400 });
  }

  return Response.json({ likeCount });
}
