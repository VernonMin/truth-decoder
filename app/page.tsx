'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { Zap, AlertTriangle, Sparkles, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { DecodeResult, EncodeResult } from '@/types';
import type { EncodeSector } from '@/lib/gemini';
import DailyRanking from '@/components/DailyRanking';
import TruthPoster, { EncodePoster } from '@/components/TruthPoster';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://td.vedi0.com';

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
  // 优先使用设备指纹（跨无痕窗口保持一致）
  const fpId = localStorage.getItem('_fpid');
  if (fpId) return fpId;
  let id = localStorage.getItem('_sid');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('_sid', id);
  }
  return id;
}

type Mode = 'decode' | 'encode';

const RAIN_CHARS = '01アイウエオカキクサシスセタチナニノハヒフ∆∇⊕⊗#$%&□■◆◇'.split('');

function CharacterRain({ mode }: { mode: Mode }) {
  const columns = useMemo(() =>
    [...Array(22)].map(() => ({
      chars: [...Array(10)].map(() => RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]),
      delay: Math.random() * 0.9,
      duration: 1.0 + Math.random() * 0.8,
    })), []
  );
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <style>{`@keyframes charFall{from{transform:translateY(-140px)}to{transform:translateY(220px)}}`}</style>
      <div style={{ position: 'relative', height: 192, overflow: 'hidden', background: '#0a0a0a', borderRadius: 8, border: '1px solid rgba(204,255,0,0.3)' }}>
        {columns.map((col, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i / 22) * 100}%`,
            animation: `charFall ${col.duration}s linear ${col.delay}s infinite`,
            fontFamily: 'monospace', fontSize: 13, lineHeight: '20px', color: '#CCFF00',
          }}>
            {col.chars.map((c, j) => (
              <div key={j} style={{ opacity: Math.max(0, 1 - j * 0.1) }}>{c}</div>
            ))}
          </div>
        ))}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(0,0,0,0.8) 35%, transparent)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#CCFF00', fontSize: 22, fontWeight: 700, textShadow: '0 0 10px #CCFF00', letterSpacing: 2 }}>
              {mode === 'decode' ? '[ 解析中 ]' : '[ 加密中 ]'}
            </div>
            <div style={{ color: 'rgba(204,255,0,0.6)', fontSize: 12, marginTop: 8 }}>
              {mode === 'decode' ? '正在撕碎职场假面...' : '正在注入职场话术...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('decode');
  const [sector, setSector] = useState<EncodeSector>('tech');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [encodeResult, setEncodeResult] = useState<EncodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [saveDataUrl, setSaveDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallLoading, setPaywallLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const encodePosterRef = useRef<HTMLDivElement>(null);
  const qrPromiseRef = useRef<Promise<string> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const FREE_LIMIT = 3;

  // 初始化用户状态
  useEffect(() => {
    fetch(`/api/credits?sessionId=${getSessionId()}`)
      .then(r => r.json() as Promise<{ usageCount: number; isPro: boolean }>)
      .then(({ usageCount, isPro }) => { setUsageCount(usageCount); setIsPro(isPro); })
      .catch(() => {});
  }, []);

  // 加载设备指纹，加载完成后若 ID 变了就重新拉取 credits
  useEffect(() => {
    const prevId = getSessionId();
    import('@fingerprintjs/fingerprintjs').then(FingerprintJS => FingerprintJS.default.load())
      .then(fp => fp.get())
      .then(({ visitorId }) => {
        localStorage.setItem('_fpid', visitorId);
        if (visitorId !== prevId) {
          fetch(`/api/credits?sessionId=${visitorId}`)
            .then(r => r.json() as Promise<{ usageCount: number; isPro: boolean }>)
            .then(({ usageCount, isPro }) => { setUsageCount(usageCount); setIsPro(isPro); })
            .catch(() => {});
        }
      })
      .catch(() => {}); // 指纹失败时降级为 UUID，不影响正常流程
  }, []);

  // 清理轮询
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  function startPolling() {
    if (pollRef.current) return;
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const { isPro } = await fetch(`/api/pay/check-order?sessionId=${getSessionId()}`)
          .then(r => r.json() as Promise<{ isPro: boolean }>);
        if (isPro) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setPolling(false);
          setIsPro(true);
          setShowPaywall(false);
        }
      } catch { /* ignore */ }
    }, 3000);
  }

  function handlePayClick() {
    const base = process.env.NEXT_PUBLIC_MBD_PRODUCT_URL;
    if (!base) { alert('支付未配置，请联系管理员'); return; }
    const payUrl = `${base}?out_order_id=${encodeURIComponent(getSessionId())}`;
    window.open(payUrl, '_blank');
    startPolling();
  }

  // 有结果时预生成二维码
  useEffect(() => {
    if (!result && !encodeResult) return;
    ensureQr().then(url => { if (url) flushSync(() => setQrDataUrl(url)); });
  }, [result, encodeResult]);

  function ensureQr(): Promise<string> {
    if (qrDataUrl) return Promise.resolve(qrDataUrl);
    if (qrPromiseRef.current) return qrPromiseRef.current;
    const qrUrl = `${APP_URL}?ref=${getSessionId()}`;
    qrPromiseRef.current = import('qrcode').then(({ default: QRCode }) =>
      QRCode.toDataURL(qrUrl, { width: 80, margin: 1, color: { dark: '#CCFF00', light: '#000000' } })
    ).catch(() => '').finally(() => { qrPromiseRef.current = null; });
    return qrPromiseRef.current;
  }

  const encodeReport = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsDecoding(true);
    setEncodeResult(null);
    setError('');

    if (navigator.vibrate) navigator.vibrate([80, 30, 80]);

    const minDelay = new Promise<void>(r => setTimeout(r, 1500));
    try {
      const [res] = await Promise.all([
        fetch('/api/encode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sessionId: getSessionId(), sector }),
        }),
        minDelay,
      ]);

      if (res.status === 402) { setShowPaywall(true); return; }
      if (!res.ok) { setError('加密失败，请稍后重试'); return; }

      const data = await res.json() as EncodeResult;
      setEncodeResult(data);
      setUsageCount(c => c !== null ? c + 1 : 1);
    } catch {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsDecoding(false);
    }
  }, [sector]);

  const generateEncodePoster = useCallback(async () => {
    if (!encodePosterRef.current) return;
    try {
      const url = await ensureQr();
      if (url && !qrDataUrl) flushSync(() => setQrDataUrl(url));
      await new Promise(r => setTimeout(r, 50));
      const dataUrl = await toPng(encodePosterRef.current!, { quality: 0.95, pixelRatio: 2, width: 600, height: 800 });
      setSaveDataUrl(dataUrl);
    } catch (e) {
      console.error('海报生成失败', e);
      alert('生成海报失败，请重试');
    }
  }, [qrDataUrl]);

  const decodeJargon = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsDecoding(true);
    setResult(null);
    setError('');

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    const minDelay = new Promise<void>(r => setTimeout(r, 1500));
    try {
      const [res] = await Promise.all([
        fetch('/api/decode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sessionId: getSessionId() }),
        }),
        minDelay,
      ]);

      if (res.status === 402) { setShowPaywall(true); return; }
      if (!res.ok) { setError('解密失败，请稍后重试'); return; }

      const data = await res.json() as DecodeResult;
      setUsageCount(c => c !== null ? c + 1 : 1);
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


  // 生成海报
  const generatePoster = useCallback(async () => {
    if (!posterRef.current) return;
    try {
      // 确保 QR 就绪（多数情况 useEffect 已预生成，此处兜底）
      const url = await ensureQr();
      if (url && !qrDataUrl) flushSync(() => setQrDataUrl(url));
      // 等一个 microtask，确保 DOM 已更新
      await new Promise(r => setTimeout(r, 50));
      const dataUrl = await toPng(posterRef.current!, { quality: 0.95, pixelRatio: 2, width: 600, height: 800 });
      setSaveDataUrl(dataUrl);
    } catch (e) {
      console.error('海报生成失败', e);
      alert('生成海报失败，请重试');
    }
  }, [qrDataUrl]);

  const reset = useCallback(() => {
    setInput('');
    setResult(null);
    setEncodeResult(null);
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-black text-neon-yellow font-mono p-4 md:p-8 relative overflow-hidden">
      <div className="scan-line" />

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
        {usageCount !== null && (
          <div className="mt-3 flex justify-center">
            {isPro ? (
              <span className="text-xs text-neon-yellow border border-neon-yellow/40 px-3 py-1 rounded-full font-bold">
                ✦ 永久会员 · 无限使用
              </span>
            ) : usageCount < FREE_LIMIT ? (
              <span className="text-xs text-neon-yellow/50 border border-neon-yellow/20 px-3 py-1 rounded-full">
                免费剩余 <span className="text-neon-yellow font-bold">{FREE_LIMIT - usageCount}</span> 次
              </span>
            ) : (
              <button onClick={() => setShowPaywall(true)} className="text-xs text-[#FF3B30] border border-[#FF3B30]/40 px-3 py-1 rounded-full hover:bg-[#FF3B30]/10 transition-all animate-pulse">
                ⚠ 免费次数已用完 · 点击解锁
              </button>
            )}
          </div>
        )}
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

      {/* 加密模式 Sector 切换 */}
      {mode === 'encode' && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex gap-2">
            {([
              { key: 'tech',   label: '🖥️ 互联网',  desc: '大厂风' },
              { key: 'gov',    label: '📋 体制内',   desc: '公文写作风' },
              { key: 'mnc',    label: '👔 外企',     desc: 'WLB & 专业风' },
            ] as { key: EncodeSector; label: string; desc: string }[]).map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSector(key)}
                className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all text-center ${
                  sector === key
                    ? 'bg-neon-yellow text-black border-neon-yellow'
                    : 'bg-[#0a0a0a] text-neon-yellow/60 border-neon-yellow/20 hover:border-neon-yellow/50 hover:text-neon-yellow'
                }`}
              >
                <div className="font-bold text-sm">{label}</div>
                <div className={`text-xs mt-0.5 ${sector === key ? 'text-black/60' : 'text-neon-yellow/40'}`}>{desc}</div>
              </button>
            ))}
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
            <><Zap className="w-6 h-6 group-hover:animate-pulse" /><span>{mode === 'decode' ? '解密' : '职场化！'}</span></>
          )}
        </button>
      </div>

      {/* 字符雨加载动效 */}
      {isDecoding && <CharacterRain mode={mode} />}

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
              <div className="bg-black/50 border border-[#FF3B30]/30 rounded p-4 text-white/90 text-sm md:text-base leading-relaxed">
                {result.responses.crazy}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <button onClick={generatePoster}
              className="flex-1 bg-neon-yellow text-black font-bold py-4 rounded-lg hover:bg-neon-yellow/90 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              <span>生成真相证书</span>
            </button>
            <button onClick={reset}
              className="flex-1 bg-[#0a0a0a] border-2 border-neon-yellow text-neon-yellow font-bold py-4 rounded-lg hover:bg-neon-yellow/10 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>再来一个</span>
            </button>
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neon-yellow" />
                <h3 className="text-lg font-bold text-neon-yellow">[ ⚡ 加密版（职场话术） ]</h3>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(encodeResult.encoded).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
                className={`flex-shrink-0 px-4 py-1.5 rounded text-sm font-bold transition-all ${copied ? 'bg-green-400/20 border border-green-400 text-green-400' : 'bg-neon-yellow text-black hover:bg-neon-yellow/80'}`}
              >
                {copied ? '✅ 已复制' : '📋 一键复制'}
              </button>
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

          {sector === 'mnc' && (
            <button
              onClick={() => setShowEmailPreview(true)}
              className="w-full bg-[#0a0a0a] border-2 border-neon-yellow/60 text-neon-yellow font-bold py-3 rounded-lg hover:bg-neon-yellow/10 transition-all flex items-center justify-center gap-2"
            >
              <span>📧</span>
              <span>生成邮件预览</span>
            </button>
          )}

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
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: 600, height: 800, overflow: 'hidden', pointerEvents: 'none' }}>
        {result && (
          <div ref={posterRef}>
            <TruthPoster
              input={input}
              result={result}
              appUrl={APP_URL}
              qrDataUrl={qrDataUrl}
            />
          </div>
        )}
      </div>

      {/* 离屏加密海报（用于截图） */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: 600, height: 800, overflow: 'hidden', pointerEvents: 'none' }}>
        {encodeResult && (
          <div ref={encodePosterRef}>
            <EncodePoster
              input={input}
              result={encodeResult}
              appUrl={APP_URL}
              qrDataUrl={qrDataUrl}
              sector={sector}
            />
          </div>
        )}
      </div>

      {/* 保存弹窗 */}
      {saveDataUrl && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
          onClick={() => setSaveDataUrl('')}
        >
          <div className="max-w-sm w-full flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <p className="text-neon-yellow font-bold text-base tracking-wide">📱 长按图片保存</p>
            <img
              src={saveDataUrl}
              alt="职场证书"
              className="w-full rounded-lg shadow-2xl"
              style={{ maxHeight: '65vh', objectFit: 'contain' }}
            />
            <p className="text-neon-yellow/60 text-sm text-center">长按图片 → 保存到相册 → 分享至小红书 / 朋友圈</p>
            <div className="flex gap-3 w-full">
              <a
                href={saveDataUrl}
                download="职场证书.png"
                className="flex-1 bg-neon-yellow text-black font-bold py-3 rounded-lg text-sm text-center hover:bg-neon-yellow/90 transition-all"
              >
                电脑下载
              </a>
              <button
                onClick={() => setSaveDataUrl('')}
                className="flex-1 bg-[#1a1a1a] border border-neon-yellow/30 text-neon-yellow/70 font-bold py-3 rounded-lg text-sm hover:bg-neon-yellow/10 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 付费解锁弹窗 */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => { if (!polling) setShowPaywall(false); }}>
          <div className="max-w-sm w-full bg-[#0a0a0a] border-2 border-neon-yellow/60 rounded-2xl p-6 flex flex-col gap-5"
            onClick={e => e.stopPropagation()}>

            <div className="text-center">
              <div className="text-5xl mb-3">🔓</div>
              <h2 className="text-xl font-bold text-white mb-1">解锁永久使用权</h2>
              <p className="text-white/50 text-sm">一次付费，永久免费，支持微信 / 支付宝</p>
            </div>

            <div className="bg-[#111] rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-white/70">
                <span>免费体验</span><span>3 次</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">解锁后</span>
                <span className="text-neon-yellow font-bold">永久无限使用</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>已使用</span><span>{usageCount ?? 0} 次</span>
              </div>
            </div>

            {polling ? (
              <div className="w-full bg-[#1a1a1a] border border-neon-yellow/30 py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm text-neon-yellow/70">
                <span className="w-4 h-4 border-2 border-neon-yellow/30 border-t-neon-yellow rounded-full animate-spin inline-block" />
                <span>正在查询支付状态...</span>
              </div>
            ) : (
              <button
                onClick={handlePayClick}
                disabled={paywallLoading}
                className="w-full bg-neon-yellow text-black font-bold py-3.5 rounded-xl hover:bg-neon-yellow/80 active:scale-95 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60"
              >
                {paywallLoading
                  ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" /><span>跳转中...</span></>
                  : <><span>💳</span><span>立即解锁</span></>
                }
              </button>
            )}

            {!polling && (
              <button onClick={() => setShowPaywall(false)}
                className="text-center text-white/25 text-xs hover:text-white/50 transition-colors">
                稍后再说
              </button>
            )}
          </div>
        </div>
      )}

      {/* 邮件预览弹窗 */}
      {showEmailPreview && encodeResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setShowEmailPreview(false)}
        >
          <div className="max-w-lg w-full flex flex-col gap-0" onClick={e => e.stopPropagation()}>
            {/* 邮件头部 */}
            <div className="bg-[#1a1a1a] border border-neon-yellow/30 rounded-t-lg px-5 py-4 font-mono">
              <div className="text-neon-yellow/40 text-xs mb-3 tracking-widest">[ 📧 EMAIL PREVIEW ]</div>
              <div className="text-sm space-y-1.5">
                <div>
                  <span className="text-neon-yellow/40">From: </span>
                  <span className="text-white/70">{getSessionId()}@company.com</span>
                </div>
                <div>
                  <span className="text-neon-yellow/40">To: </span>
                  <span className="text-white/70">team@company.com</span>
                </div>
                <div className="border-t border-neon-yellow/10 pt-1.5">
                  <span className="text-neon-yellow/40">Subject: </span>
                  <span className="text-white font-bold">[Update] Business Trip Sync - Shanghai / HK / NYC</span>
                </div>
              </div>
            </div>
            {/* 邮件正文 */}
            <div className="bg-[#0d0d0d] border-x border-neon-yellow/30 px-5 py-5 font-mono text-sm leading-relaxed space-y-4">
              <p className="text-white/80">Hi Team,</p>
              <p className="text-white">{encodeResult.encoded}</p>
              <div className="pt-1">
                <p className="text-white/80">Best Regards,</p>
                <p className="text-neon-yellow font-bold">{getSessionId()}</p>
              </div>
            </div>
            {/* 按钮 */}
            <div className="bg-[#1a1a1a] border border-neon-yellow/30 rounded-b-lg px-5 py-4 flex gap-3">
              <button
                onClick={() => {
                  const emailText = `Subject: [Update] Business Trip Sync - Shanghai / HK / NYC\n\nHi Team,\n\n${encodeResult.encoded}\n\nBest Regards,\n${getSessionId()}`;
                  navigator.clipboard.writeText(emailText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
                }}
                className={`flex-1 font-bold py-3 rounded-lg text-sm transition-all ${copied ? 'bg-green-400/20 border border-green-400 text-green-400' : 'bg-neon-yellow text-black hover:bg-neon-yellow/80'}`}
              >
                {copied ? '✅ 已复制' : '📋 复制邮件'}
              </button>
              <button
                onClick={() => setShowEmailPreview(false)}
                className="flex-1 bg-transparent border border-neon-yellow/30 text-neon-yellow/60 font-bold py-3 rounded-lg text-sm hover:bg-neon-yellow/10 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <DailyRanking sessionId={getSessionId()} />

      <footer className="max-w-4xl mx-auto mt-16 mb-8 text-center text-neon-yellow/50 text-sm">
        <p className="mb-2">职场没有真情，只有颗粒度</p>
        <p className="mb-4">推开这扇门，撕碎这张饼</p>
        <p className="text-xs">本产品仅供娱乐和情绪价值，请理性对待职场关系</p>
        <p className="text-xs text-gray-600 mt-3">免责声明：内容由 AI 生成，仅供娱乐，不构成任何职业建议，不代表任何立场。</p>
      </footer>
    </div>
  );
}
