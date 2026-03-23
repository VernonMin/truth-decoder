'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, ThumbsUp, Trophy } from 'lucide-react';

interface RankItem {
  input_text: string;
  pua_level: number;
  decode_count: number;
  like_count: number;
}

const PUA_COLORS = ['', 'text-green-500', 'text-yellow-500', 'text-orange-500', 'text-red-400', 'text-red-600'];

export default function DailyRanking({ sessionId }: { sessionId: string }) {
  const [items, setItems] = useState<RankItem[]>([]);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ranking')
      .then(r => r.json())
      .then((data: unknown) => {
        const d = data as { items: RankItem[] };
        setItems(d.items ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLike = useCallback(async (inputText: string) => {
    if (likedSet.has(inputText)) return;

    const res = await fetch('/api/ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, inputText }),
    });
    const data = await res.json() as { likeCount?: number; alreadyLiked?: boolean };

    if (data.likeCount !== undefined) {
      setLikedSet(prev => new Set(prev).add(inputText));
      setItems(prev =>
        prev.map(item =>
          item.input_text === inputText
            ? { ...item, like_count: data.likeCount! }
            : item
        )
      );
    }
  }, [likedSet, sessionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-16">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-[#FB7185]" />
          <h2 className="text-xl font-bold text-[#2D1B69]">今日职场热词榜</h2>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white border border-[#F9C8E0] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-16 text-center text-[#9E9AB8] text-sm">
        <Flame className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#FB7185]" />
        <p>今日榜单空空如也，快去翻译第一条黑话！</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-[#FB7185] animate-pulse" />
        <h2 className="text-xl font-bold text-[#2D1B69]">今日职场热词榜</h2>
        <span className="text-xs text-[#9E9AB8] ml-auto">每日 0 点重置</span>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.input_text}
            className="bg-white border border-[#F9C8E0] rounded-2xl p-4 flex items-center gap-4 hover:border-[#FF6EB4]/50 hover:shadow-sm transition-all"
          >
            {/* 排名 */}
            <div className="w-8 flex-shrink-0 text-center">
              {index === 0 ? (
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto" />
              ) : index === 1 ? (
                <Trophy className="w-5 h-5 text-gray-400 mx-auto" />
              ) : index === 2 ? (
                <Trophy className="w-5 h-5 text-amber-700 mx-auto" />
              ) : (
                <span className="text-[#9E9AB8] text-sm font-bold">{index + 1}</span>
              )}
            </div>

            {/* 黑话内容 */}
            <div className="flex-1 min-w-0">
              <p className="text-[#2D1B69] text-sm truncate font-medium">{item.input_text}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs ${PUA_COLORS[item.pua_level] ?? 'text-[#9E9AB8]'}`}>
                  {'★'.repeat(item.pua_level)}{'☆'.repeat(5 - item.pua_level)} PUA
                </span>
                <span className="text-xs text-[#9E9AB8]">
                  {item.decode_count} 人翻译过
                </span>
              </div>
            </div>

            {/* 点赞 */}
            <button
              onClick={() => handleLike(item.input_text)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all flex-shrink-0 ${
                likedSet.has(item.input_text)
                  ? 'bg-[#FF6EB4]/20 text-[#FF6EB4] cursor-default'
                  : 'bg-[#FFF5FB] text-[#9E9AB8] hover:bg-[#FF6EB4]/10 hover:text-[#FF6EB4] border border-[#F9C8E0]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{item.like_count}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
