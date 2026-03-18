'use client';

import { useState, useRef, useCallback } from 'react';
import { Zap, Download, AlertTriangle, Sparkles, Lock } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { DecodeResult } from '@/types';
import DailyRanking from '@/components/DailyRanking';

const VIRAL_QUOTES = [
  '工作是换钱的，不是换命的。',
  '所谓福报，就是老板换车的钱，你出的命。',
  '与其提升认知，不如提升时薪。',
  '颗粒度再细，也填不饱你的胃。',
  '赋能的尽头，是你的加班。',
  '闭环的本质，是让你转圈圈。',
  '对齐的目的，是让你闭嘴。',
  '抓手抓的是你的时间，杠杆撬的是你的命。',
];

function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem('_sid');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('_sid', id);
  }
  return id;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);

  const decodeJargon = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsDecoding(true);
    setResult(null);
    setIsUnlocked(false);
    setError('');

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    try {
      const res = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sessionId: getSessionId() }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        if (data.error === 'RATE_LIMIT') {
          setError('今日免费次数已用完，明天再来吧 👀');
        } else {
          setError('解密失败，请稍后重试');
        }
        return;
      }

      const data = await res.json() as DecodeResult;
      setResult({
        ...data,
        quote: data.quote || VIRAL_QUOTES[Math.floor(Math.random() * VIRAL_QUOTES.length)],
      });
    } catch {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsDecoding(false);
    }
  }, []);

  const unlockCrazyResponse = useCallback(() => {
    // 模拟广告观看
    alert('模拟：观看广告中... 3秒后解锁');
    setTimeout(() => {
      setIsUnlocked(true);
    }, 3000);
  }, []);

  const generatePoster = useCallback(async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = '职场黑话翻译-真相揭露.png';
      link.href = dataUrl;
      link.click();
    } catch {
      alert('生成海报失败，请重试');
    }
  }, []);

  const reset = useCallback(() => {
    setInput('');
    setResult(null);
    setIsUnlocked(false);
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-black text-neon-yellow font-mono p-4 md:p-8 relative overflow-hidden">
      <div className="scan-line" />

      {/* Header */}
      <header className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-alert-red animate-pulse" />
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold neon-text">
            职场黑话翻译站
          </h1>
          <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-alert-red animate-pulse" />
        </div>
        <p className="text-sm md:text-lg text-neon-yellow/80 tracking-wider">
          [ 撕碎职场假面，还你人间清醒 ]
        </p>
      </header>

      {/* Input */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴那句让你想翻白眼的黑话..."
            className="w-full h-40 md:h-48 bg-[#0a0a0a] border-2 border-neon-yellow/30 rounded-lg p-4 md:p-6 text-base md:text-lg text-neon-yellow placeholder-neon-yellow/40 focus:outline-none focus:border-neon-yellow transition-all resize-none"
            disabled={isDecoding}
          />
          {input && (
            <div className="absolute top-2 right-2 text-xs text-neon-yellow/60">
              {input.length} 字符
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 text-alert-red text-sm text-center">{error}</div>
        )}

        <button
          onClick={() => decodeJargon(input)}
          disabled={isDecoding || !input.trim()}
          className="w-full mt-6 bg-neon-yellow text-black font-bold text-lg md:text-xl py-4 md:py-5 rounded-lg hover:bg-neon-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
        >
          {isDecoding ? (
            <>
              <Sparkles className="w-6 h-6 animate-spin" />
              <span>解密中...</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 group-hover:animate-pulse" />
              <span>解密真相</span>
            </>
          )}
        </button>
      </div>

      {/* Scanning animation */}
      {isDecoding && (
        <div className="max-w-4xl mx-auto mb-12 animate-pulse">
          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-8 relative overflow-hidden">
            <div className="scan-line" />
            <div className="text-center space-y-4">
              <div className="text-2xl neon-text">[ 数据流扫描中 ]</div>
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-neon-yellow rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <div className="text-sm text-neon-yellow/60">正在撕碎职场假面...</div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isDecoding && (
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
          {/* Original */}
          <div className="bg-[#0a0a0a] border border-[#FF3B30]/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
              <h3 className="text-lg font-bold text-[#FF3B30]">[ 原文黑话 ]</h3>
            </div>
            <p className="text-white/90 text-base md:text-lg leading-relaxed">{input}</p>
          </div>

          {/* Translation */}
          <div className="bg-[#0a0a0a] border-2 border-neon-yellow rounded-lg p-6 neon-border">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-neon-yellow" />
              <h3 className="text-lg font-bold text-neon-yellow">[ 人话翻译 ]</h3>
            </div>
            <p className="text-white text-base md:text-lg leading-relaxed font-bold">{result.translation}</p>
          </div>

          {/* PUA Level */}
          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">[ PUA 等级 ]</h3>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded border-2 flex items-center justify-center font-bold ${
                    i < result.puaLevel
                      ? 'bg-[#FF3B30] border-[#FF3B30] text-white'
                      : 'border-neon-yellow/30 text-neon-yellow/30'
                  }`}
                >
                  ★
                </div>
              ))}
              <span className="ml-4 text-[#FF3B30] font-bold text-lg">
                {result.puaLevel === 5 ? '极度危险！' : result.puaLevel >= 3 ? '高度警惕！' : '轻度PUA'}
              </span>
            </div>
          </div>

          {/* Boss Intention */}
          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">[ 老板心机 ]</h3>
            <p className="text-white/80 text-base leading-relaxed">{result.bossIntention}</p>
          </div>

          {/* Responses */}
          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">[ 神回怼 ]</h3>

            <div className="mb-6">
              <div className="text-sm text-neon-yellow/70 mb-2">💼 高情商阴阳怪气版：</div>
              <div className="bg-black/50 border border-neon-yellow/20 rounded p-4 text-white/90 text-sm md:text-base leading-relaxed">
                {result.responses.polite}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#FF3B30]/70 mb-2">🔥 直接发疯版：</div>
              {isUnlocked ? (
                <div className="bg-black/50 border border-[#FF3B30]/30 rounded p-4 text-white/90 text-sm md:text-base leading-relaxed">
                  {result.responses.crazy}
                </div>
              ) : (
                <div className="bg-black/50 border border-[#FF3B30]/30 rounded p-4 relative">
                  <div className="blur-sm text-white/50 text-sm md:text-base select-none">
                    {result.responses.crazy}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={unlockCrazyResponse}
                      className="bg-[#FF3B30] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#FF3B30]/90 transition-all"
                    >
                      <Lock className="w-5 h-5" />
                      <span>观看广告解锁</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={generatePoster}
              className="flex-1 bg-neon-yellow text-black font-bold py-4 rounded-lg hover:bg-neon-yellow/90 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>生成爆火海报</span>
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-[#0a0a0a] border-2 border-neon-yellow text-neon-yellow font-bold py-4 rounded-lg hover:bg-neon-yellow/10 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>再来一个</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden poster for image export */}
      {result && (
        <div
          ref={posterRef}
          className="fixed -left-[9999px] w-[600px] bg-black p-8 font-mono"
        >
          <div className="border-4 border-neon-yellow p-6 space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-yellow mb-2">职场黑话翻译站</div>
              <div className="text-sm text-neon-yellow/70">[ 撕碎职场假面，还你人间清醒 ]</div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-[#FF3B30]/50 p-4">
              <div className="text-[#FF3B30] font-bold mb-2">原文黑话：</div>
              <div className="text-white text-lg">{input}</div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-neon-yellow p-4">
              <div className="text-neon-yellow font-bold mb-2">人话翻译：</div>
              <div className="text-white text-lg font-bold">{result.translation}</div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-white">PUA 等级：</span>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-2xl ${i < result.puaLevel ? 'text-[#FF3B30]' : 'text-gray-600'}`}>★</span>
              ))}
            </div>
            <div className="bg-neon-yellow text-black p-4 text-center">
              <div className="text-xl font-bold">{result.quote}</div>
            </div>
            <div className="text-center text-neon-yellow/70 text-sm">扫码体验更多职场真相</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <DailyRanking sessionId={getSessionId()} />

      <footer className="max-w-4xl mx-auto mt-16 mb-8 text-center text-neon-yellow/50 text-sm">
        <p className="mb-2">职场没有真情，只有颗粒度</p>
        <p className="mb-4">推开这扇门，撕碎这张饼</p>
        <p className="text-xs">本产品仅供娱乐和情绪价值，请理性对待职场关系</p>
      </footer>
    </div>
  );
}
