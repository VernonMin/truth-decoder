'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Zap, Download, AlertTriangle, Sparkles, Lock, Share2, Gift } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { DecodeResult, EncodeResult } from '@/types';
import DailyRanking from '@/components/DailyRanking';
import TruthPoster, { EncodePoster } from '@/components/TruthPoster';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://truth-decoder.pages.dev';

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

// 从 URL 读取 ref 参数（好友分享的真相码）
function getRefFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('ref');
}

type Mode = 'decode' | 'encode';

export default function Home() {
  const [mode, setMode] = useState<Mode>('decode');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [encodeResult, setEncodeResult] = useState<EncodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [truthCode, setTruthCode] = useState('TK-??????');
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [buddyInput, setBuddyInput] = useState('');
  const [buddyMsg, setBuddyMsg] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);
  const encodePosterRef = useRef<HTMLDivElement>(null);

  // 页面加载：检查 ref 参数 + 查询 buddy 状态
  useEffect(() => {
    const ref = getRefFromUrl();
    const sid = getSessionId();

    fetch(`/api/buddy/status?sessionId=${sid}`)
      .then(r => r.json())
      .then((data: unknown) => {
        const d = data as {
          unlockedByBuddy?: boolean;
          referrerName?: string | null;
          ownBuddyKey?: { key: string; used: boolean } | null;
        };
        if (d.unlockedByBuddy) setIsUnlocked(true);
        if (d.referrerName) setReferrerName(d.referrerName);
        if (d.ownBuddyKey?.key) setTruthCode(d.ownBuddyKey.key);
      })
      .catch(() => {});

    // 如果 URL 带了 ref，自动尝试兑换
    if (ref) {
      fetch('/api/buddy/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: ref, sessionId: sid }),
      })
        .then(r => r.json())
        .then((data: unknown) => {
          const d = data as { success?: boolean; message?: string };
          if (d.success) {
            setIsUnlocked(true);
            // 重新拉取 referrerName
            fetch(`/api/buddy/status?sessionId=${sid}`)
              .then(r => r.json())
              .then((s: unknown) => {
                const sd = s as { referrerName?: string | null };
                if (sd.referrerName) setReferrerName(sd.referrerName);
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  const encodeReport = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsDecoding(true);
    setEncodeResult(null);
    setError('');

    if (navigator.vibrate) navigator.vibrate([80, 30, 80]);

    try {
      const res = await fetch('/api/encode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sessionId: getSessionId() }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error === 'RATE_LIMIT' ? '今日免费次数已用完，明天再来吧 👀' : '加密失败，请稍后重试');
        return;
      }

      const data = await res.json() as EncodeResult;
      setEncodeResult(data);
    } catch {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsDecoding(false);
    }
  }, []);

  const generateEncodePoster = useCallback(async () => {
    if (!encodePosterRef.current) return;
    try {
      const dataUrl = await toPng(encodePosterRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `职场话术加密证书.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('生成海报失败，请重试');
    }
  }, []);

  const decodeJargon = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsDecoding(true);
    setResult(null);
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
        setError(data.error === 'RATE_LIMIT' ? '今日免费次数已用完，明天再来吧 👀' : '解密失败，请稍后重试');
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
    alert('模拟：观看广告中... 3秒后解锁');
    setTimeout(() => setIsUnlocked(true), 3000);
  }, []);

  // 手动输入真相码兑换
  const redeemBuddyKey = useCallback(async () => {
    if (!buddyInput.trim()) return;
    const res = await fetch('/api/buddy/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: buddyInput.trim(), sessionId: getSessionId() }),
    });
    const data = await res.json() as { success?: boolean; message?: string };
    setBuddyMsg(data.message ?? '');
    if (data.success) setIsUnlocked(true);
  }, [buddyInput]);

  // 生成海报
  const generatePoster = useCallback(async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `职场真相证书-${truthCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('生成海报失败，请重试');
    }
  }, [truthCode]);

  const reset = useCallback(() => {
    setInput('');
    setResult(null);
    setEncodeResult(null);
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-black text-neon-yellow font-mono p-4 md:p-8 relative overflow-hidden">
      <div className="scan-line" />

      {/* 好友 referral 提示横幅 */}
      {referrerName && (
        <div className="max-w-4xl mx-auto mb-6 bg-neon-yellow/10 border border-neon-yellow/40 rounded-lg px-5 py-3 flex items-center gap-3 animate-fade-in">
          <Gift className="w-5 h-5 text-neon-yellow flex-shrink-0" />
          <p className="text-sm text-neon-yellow">
            你的朋友 <span className="font-bold">{referrerName}</span> 刚逃出了一个 PUA 陷阱，现在轮到你了 👀
          </p>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-alert-red animate-pulse" />
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold neon-text">
            {mode === 'decode' ? '职场黑话翻译站' : '职场话术加密站'}
          </h1>
          <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-alert-red animate-pulse" />
        </div>
        <p className="text-sm md:text-lg text-neon-yellow/80 tracking-wider">
          {mode === 'decode' ? '[ 撕碎职场假面，还你人间清醒 ]' : '[ 白话变黑话，让老板看不懂你有多闲 ]'}
        </p>
      </header>

      {/* 模式切换 */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex rounded-lg overflow-hidden border-2 border-neon-yellow/30">
          <button
            onClick={() => { setMode('decode'); reset(); }}
            className={`flex-1 py-3 text-sm font-bold transition-all ${
              mode === 'decode'
                ? 'bg-neon-yellow text-black'
                : 'bg-[#0a0a0a] text-neon-yellow/60 hover:text-neon-yellow hover:bg-neon-yellow/10'
            }`}
          >
            🔍 解密模式 · 黑话→人话
          </button>
          <button
            onClick={() => { setMode('encode'); reset(); }}
            className={`flex-1 py-3 text-sm font-bold transition-all ${
              mode === 'encode'
                ? 'bg-neon-yellow text-black'
                : 'bg-[#0a0a0a] text-neon-yellow/60 hover:text-neon-yellow hover:bg-neon-yellow/10'
            }`}
          >
            ⚡ 加密模式 · 周报职场化
          </button>
        </div>
      </div>

      {/* 真相码兑换入口（未解锁时显示） */}
      {!isUnlocked && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-[#0a0a0a] border border-neon-yellow/20 rounded-lg p-4 flex flex-col sm:flex-row gap-3 items-center">
            <span className="text-sm text-neon-yellow/60 flex-shrink-0">有真相码？</span>
            <input
              value={buddyInput}
              onChange={e => setBuddyInput(e.target.value.toUpperCase())}
              placeholder="输入 TK-XXXXXX"
              maxLength={9}
              className="flex-1 bg-black border border-neon-yellow/30 rounded px-3 py-2 text-sm text-neon-yellow placeholder-neon-yellow/30 focus:outline-none focus:border-neon-yellow font-mono"
            />
            <button
              onClick={redeemBuddyKey}
              className="bg-neon-yellow text-black font-bold px-5 py-2 rounded text-sm hover:bg-neon-yellow/90 transition-all flex-shrink-0"
            >
              解锁
            </button>
            {buddyMsg && (
              <span className={`text-xs ${buddyMsg.includes('成功') ? 'text-green-400' : 'text-[#FF3B30]'}`}>
                {buddyMsg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'decode' ? '粘贴那句让你想翻白眼的黑话...' : '粘贴你的周报或日报（白话版），让 AI 帮你职场化...'}
            className="w-full h-40 md:h-48 bg-[#0a0a0a] border-2 border-neon-yellow/30 rounded-lg p-4 md:p-6 text-base md:text-lg text-neon-yellow placeholder-neon-yellow/40 focus:outline-none focus:border-neon-yellow transition-all resize-none"
            disabled={isDecoding}
          />
          {input && (
            <div className="absolute top-2 right-2 text-xs text-neon-yellow/60">{input.length} 字符</div>
          )}
        </div>

        {error && <div className="mt-3 text-alert-red text-sm text-center">{error}</div>}

        <button
          onClick={() => mode === 'decode' ? decodeJargon(input) : encodeReport(input)}
          disabled={isDecoding || !input.trim()}
          className="w-full mt-6 bg-neon-yellow text-black font-bold text-lg md:text-xl py-4 md:py-5 rounded-lg hover:bg-neon-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
        >
          {isDecoding ? (
            <><Sparkles className="w-6 h-6 animate-spin" /><span>{mode === 'decode' ? '解密中...' : '加密中...'}</span></>
          ) : (
            <><Zap className="w-6 h-6 group-hover:animate-pulse" /><span>{mode === 'decode' ? '解密真相' : '职场化！'}</span></>
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
                  <div key={i} className="w-3 h-3 bg-neon-yellow rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <div className="text-sm text-neon-yellow/60">{mode === 'decode' ? '正在撕碎职场假面...' : '正在注入职场话术...'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isDecoding && mode === 'decode' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
          <div className="bg-[#0a0a0a] border border-[#FF3B30]/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
              <h3 className="text-lg font-bold text-[#FF3B30]">[ 原文黑话 ]</h3>
            </div>
            <p className="text-white/90 text-base md:text-lg leading-relaxed">{input}</p>
          </div>

          <div className="bg-[#0a0a0a] border-2 border-neon-yellow rounded-lg p-6 neon-border">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-neon-yellow" />
              <h3 className="text-lg font-bold text-neon-yellow">[ 人话翻译 ]</h3>
            </div>
            <p className="text-white text-base md:text-lg leading-relaxed font-bold">{result.translation}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">[ PUA 等级 ]</h3>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-8 h-8 md:w-10 md:h-10 rounded border-2 flex items-center justify-center font-bold ${
                  i < result.puaLevel ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 'border-neon-yellow/30 text-neon-yellow/30'
                }`}>★</div>
              ))}
              <span className="ml-4 text-[#FF3B30] font-bold text-lg">
                {result.puaLevel === 5 ? '极度危险！' : result.puaLevel >= 3 ? '高度警惕！' : '轻度PUA'}
              </span>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">[ 老板心机 ]</h3>
            <p className="text-white/80 text-base leading-relaxed">{result.bossIntention}</p>
          </div>

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
                  <div className="blur-sm text-white/50 text-sm md:text-base select-none">{result.responses.crazy}</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button onClick={unlockCrazyResponse}
                      className="bg-[#FF3B30] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#FF3B30]/90 transition-all">
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
            <button onClick={generatePoster}
              className="flex-1 bg-neon-yellow text-black font-bold py-4 rounded-lg hover:bg-neon-yellow/90 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              <span>生成真相证书 · 分享裂变</span>
            </button>
            <button onClick={reset}
              className="flex-1 bg-[#0a0a0a] border-2 border-neon-yellow text-neon-yellow font-bold py-4 rounded-lg hover:bg-neon-yellow/10 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>再来一个</span>
            </button>
          </div>

          {/* 真相码展示 */}
          <div className="bg-[#0a0a0a] border border-neon-yellow/20 rounded-lg p-5 text-center">
            <p className="text-xs text-neon-yellow/50 mb-2">你的专属真相码（截图分享，好友可免费解锁发疯回复）</p>
            <div className="text-3xl font-bold neon-text tracking-widest">{truthCode}</div>
            <p className="text-xs text-neon-yellow/40 mt-2">7 天有效 · 限 1 人使用</p>
          </div>
        </div>
      )}

      {/* 加密模式结果 */}
      {encodeResult && !isDecoding && mode === 'encode' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
          <div className="bg-[#0a0a0a] border border-neon-yellow/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-neon-yellow/50" />
              <h3 className="text-base font-bold text-neon-yellow/50">[ 原文（真实版） ]</h3>
            </div>
            <p className="text-white/50 text-sm leading-relaxed italic">{input}</p>
          </div>

          <div className="bg-[#0a0a0a] border-2 border-neon-yellow rounded-lg p-6 neon-border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-neon-yellow" />
              <h3 className="text-lg font-bold text-neon-yellow">[ ⚡ 加密版（职场话术） ]</h3>
            </div>
            <p className="text-white text-base leading-relaxed font-semibold">{encodeResult.encoded}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-6">
            <h3 className="text-base font-bold mb-3">[ 核心黑话关键词 ]</h3>
            <div className="flex flex-wrap gap-2">
              {encodeResult.buzzwords.map((w, i) => (
                <span key={i} className="bg-neon-yellow/10 border border-neon-yellow/30 text-neon-yellow text-sm font-bold px-3 py-1 rounded">
                  #{w}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-neon-yellow/30 rounded-lg p-6">
            <h3 className="text-base font-bold mb-3">[ 逼格评分 ]</h3>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-8 h-8 md:w-10 md:h-10 rounded border-2 flex items-center justify-center font-bold ${
                  i < encodeResult.professionalScore
                    ? 'bg-neon-yellow border-neon-yellow text-black'
                    : 'border-neon-yellow/20 text-neon-yellow/20'
                }`}>★</div>
              ))}
              <span className="ml-4 text-neon-yellow font-bold text-base">
                {encodeResult.professionalScore >= 4 ? '让老板眼前一亮！' : encodeResult.professionalScore >= 3 ? '中规中矩' : '再加几个黑话'}
              </span>
            </div>
          </div>

          <div className="bg-neon-yellow rounded-lg p-5 text-center">
            <p className="text-black font-bold text-base">{encodeResult.sarcasm}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button onClick={generateEncodePoster}
              className="flex-1 bg-neon-yellow text-black font-bold py-4 rounded-lg hover:bg-neon-yellow/90 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              <span>生成加密证书 · 分享晒丑</span>
            </button>
            <button onClick={reset}
              className="flex-1 bg-[#0a0a0a] border-2 border-neon-yellow text-neon-yellow font-bold py-4 rounded-lg hover:bg-neon-yellow/10 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>再加密一份</span>
            </button>
          </div>
        </div>
      )}

      {/* 离屏海报（用于截图） */}
      {result && (
        <div ref={posterRef} className="fixed -left-[9999px]">
          <TruthPoster
            input={input}
            result={result}
            truthCode={truthCode}
            appUrl={APP_URL}
          />
        </div>
      )}

      {/* 离屏加密海报（用于截图） */}
      {encodeResult && (
        <div ref={encodePosterRef} className="fixed -left-[9999px]">
          <EncodePoster
            input={input}
            result={encodeResult}
            appUrl={APP_URL}
          />
        </div>
      )}

      <DailyRanking sessionId={getSessionId()} />

      <footer className="max-w-4xl mx-auto mt-16 mb-8 text-center text-neon-yellow/50 text-sm">
        <p className="mb-2">职场没有真情，只有颗粒度</p>
        <p className="mb-4">推开这扇门，撕碎这张饼</p>
        <p className="text-xs">本产品仅供娱乐和情绪价值，请理性对待职场关系</p>
      </footer>
    </div>
  );
}
