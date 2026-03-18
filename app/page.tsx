'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Zap, AlertTriangle, Sparkles, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { DecodeResult, EncodeResult } from '@/types';
import type { EncodeSector } from '@/lib/gemini';
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

type Mode = 'decode' | 'encode';

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
  const posterRef = useRef<HTMLDivElement>(null);
  const encodePosterRef = useRef<HTMLDivElement>(null);

  // 有结果时生成二维码
  useEffect(() => {
    if (!result && !encodeResult) return;
    import('qrcode').then(QRCode => {
      QRCode.default.toDataURL(APP_URL, {
        width: 80,
        margin: 1,
        color: { dark: '#CCFF00', light: '#000000' },
      }).then(url => setQrDataUrl(url)).catch(() => {});
    });
  }, [result, encodeResult]);

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
        body: JSON.stringify({ text, sessionId: getSessionId(), sector }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError('加密失败，请稍后重试');
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
      const dataUrl = await toPng(encodePosterRef.current, { quality: 0.95, pixelRatio: 2, width: 600, height: 800 });
      setSaveDataUrl(dataUrl);
    } catch (e) {
      console.error('海报生成失败', e);
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
        setError('解密失败，请稍后重试');
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


  // 生成海报
  const generatePoster = useCallback(async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95, pixelRatio: 2, width: 600, height: 800 });
      setSaveDataUrl(dataUrl);
    } catch (e) {
      console.error('海报生成失败', e);
      alert('生成海报失败，请重试');
    }
  }, []);

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
              { key: 'insane', label: '🦛 水豚',     desc: '优雅躺平风' },
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
              <span>生成真相证书 · 分享裂变</span>
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

      <DailyRanking sessionId={getSessionId()} />

      <footer className="max-w-4xl mx-auto mt-16 mb-8 text-center text-neon-yellow/50 text-sm">
        <p className="mb-2">职场没有真情，只有颗粒度</p>
        <p className="mb-4">推开这扇门，撕碎这张饼</p>
        <p className="text-xs">本产品仅供娱乐和情绪价值，请理性对待职场关系</p>
      </footer>
    </div>
  );
}
