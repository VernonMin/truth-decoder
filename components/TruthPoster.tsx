import type { DecodeResult, EncodeResult } from '@/types';

interface Props {
  input: string;
  result: DecodeResult;
  appUrl: string;      // 例如 https://truth-decoder.pages.dev
}

const PUA_LABEL: Record<number, string> = {
  1: '轻微不适',
  2: '有点恶心',
  3: '明显PUA',
  4: '严重控制',
  5: '极度危险',
};

// 离屏渲染海报，用 html-to-image 截图
export default function TruthPoster({ input, result, appUrl }: Props) {
  return (
    <div
      style={{
        width: 600,
        background: '#000',
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
        padding: 0,
      }}
    >
      {/* 顶部警示条 */}
      <div style={{ background: '#FF3B30', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>
          ⚠ 职场真相证书 · TRUTH CERTIFICATE
        </span>
      </div>

      <div style={{ padding: '28px 32px', border: '2px solid #CCFF00', margin: '0 16px 0 16px' }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ color: '#CCFF00', fontSize: 26, fontWeight: 700, letterSpacing: 1,
            textShadow: '0 0 10px #CCFF00' }}>
            职场黑话翻译站
          </div>
          <div style={{ color: 'rgba(204,255,0,0.6)', fontSize: 11, marginTop: 4 }}>
            撕碎职场假面，还你人间清醒
          </div>
        </div>

        {/* 原文 */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,59,48,0.5)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ color: '#FF3B30', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            原文黑话
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 1.6 }}>
            {input.slice(0, 80)}{input.length > 80 ? '...' : ''}
          </div>
        </div>

        {/* 翻译 */}
        <div style={{ background: '#0a0a0a', border: '2px solid #CCFF00',
          borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ color: '#CCFF00', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
            人话翻译
          </div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>
            {result.translation}
          </div>
        </div>

        {/* PUA 等级 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ color: 'rgba(204,255,0,0.7)', fontSize: 12 }}>PUA 等级</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{
                fontSize: 18,
                color: i < result.puaLevel ? '#FF3B30' : '#333',
              }}>★</span>
            ))}
          </div>
          <span style={{ color: '#FF3B30', fontSize: 12, fontWeight: 700 }}>
            {PUA_LABEL[result.puaLevel] ?? ''}
          </span>
        </div>

        {/* 金句 */}
        <div style={{ background: '#CCFF00', borderRadius: 8, padding: '14px 20px',
          textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color: '#000', fontSize: 15, fontWeight: 700 }}>
            {result.quote}
          </div>
        </div>

        {/* 底部：URL */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(204,255,0,0.5)', fontSize: 10, marginBottom: 4 }}>
            你的老板 PUA 等级是几星？
          </div>
          <div style={{ color: '#CCFF00', fontSize: 12 }}>
            {appUrl}
          </div>
        </div>
      </div>

      {/* 底部黑条 */}
      <div style={{ background: '#0a0a0a', padding: '8px 24px', textAlign: 'center' }}>
        <span style={{ color: 'rgba(204,255,0,0.4)', fontSize: 10 }}>
          仅供娱乐，理性对待职场关系
        </span>
      </div>
    </div>
  );
}

// ——— 加密模式海报（黑金警示风） ———

interface EncodePosterProps {
  input: string;
  result: EncodeResult;
  appUrl: string;
}

const SCORE_LABEL: Record<number, string> = {
  1: '白话加工版',
  2: '初级打工人',
  3: '资深职场人',
  4: '准中层干部',
  5: 'MBA附体',
};

export function EncodePoster({ input, result, appUrl }: EncodePosterProps) {
  return (
    <div
      style={{
        width: 600,
        background: '#000000',
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
        padding: 0,
      }}
    >
      {/* 顶部金色警示条 */}
      <div style={{
        background: '#CCFF00',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ color: '#000', fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>
          ⚡ 职场话术加密证书 · ENCODE CERTIFICATE
        </span>
        <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>
          逼格值 {'★'.repeat(result.professionalScore)}{'☆'.repeat(5 - result.professionalScore)}
        </span>
      </div>

      <div style={{ padding: '24px 28px', border: '2px solid #CCFF00', margin: '0 16px' }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color: '#CCFF00', fontSize: 22, fontWeight: 700, letterSpacing: 1,
            textShadow: '0 0 10px rgba(204,255,0,0.6)' }}>
            职场话术加密站
          </div>
          <div style={{ color: 'rgba(204,255,0,0.5)', fontSize: 11, marginTop: 4 }}>
            白话变黑话，让老板看不懂你有多闲
          </div>
        </div>

        {/* 原文 */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(204,255,0,0.3)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 12 }}>
          <div style={{ color: 'rgba(204,255,0,0.6)', fontSize: 10, fontWeight: 700,
            letterSpacing: 1, marginBottom: 6 }}>
            原文（真实版）
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6,
            fontStyle: 'italic' }}>
            {input.slice(0, 100)}{input.length > 100 ? '...' : ''}
          </div>
        </div>

        {/* 加密后的黑话版本 */}
        <div style={{ background: '#0d0d0d', border: '2px solid #CCFF00',
          borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ color: '#CCFF00', fontSize: 10, fontWeight: 700,
            letterSpacing: 1, marginBottom: 8 }}>
            ⚡ 加密版（职场话术）
          </div>
          <div style={{ color: '#ffffff', fontSize: 14, fontWeight: 600, lineHeight: 1.8 }}>
            {result.encoded}
          </div>
        </div>

        {/* 关键黑话词 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {result.buzzwords.slice(0, 5).map((word, i) => (
            <span key={i} style={{
              background: 'rgba(204,255,0,0.12)',
              border: '1px solid rgba(204,255,0,0.4)',
              borderRadius: 4,
              padding: '3px 10px',
              color: '#CCFF00',
              fontSize: 12,
              fontWeight: 700,
            }}>
              #{word}
            </span>
          ))}
        </div>

        {/* 逼格评分 + 等级 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ color: 'rgba(204,255,0,0.6)', fontSize: 11 }}>逼格等级</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{
                fontSize: 16,
                color: i < result.professionalScore ? '#CCFF00' : '#222',
              }}>★</span>
            ))}
          </div>
          <span style={{ color: '#CCFF00', fontSize: 12, fontWeight: 700 }}>
            {SCORE_LABEL[result.professionalScore] ?? ''}
          </span>
        </div>

        {/* 毒舌点评 */}
        <div style={{
          background: '#CCFF00',
          borderRadius: 8,
          padding: '12px 18px',
          textAlign: 'center',
          marginBottom: 18,
        }}>
          <div style={{ color: '#000', fontSize: 13, fontWeight: 700 }}>
            {result.sarcasm}
          </div>
        </div>

        {/* 底部 URL */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(204,255,0,0.4)', fontSize: 10, marginBottom: 3 }}>
            你的报告也能职场化？
          </div>
          <div style={{ color: '#CCFF00', fontSize: 11 }}>{appUrl}</div>
        </div>
      </div>

      {/* 底部条 */}
      <div style={{ background: '#0a0a0a', padding: '8px 24px', textAlign: 'center' }}>
        <span style={{ color: 'rgba(204,255,0,0.35)', fontSize: 10 }}>
          以上话术纯属娱乐 · 请勿直接发给老板 · 后果自负
        </span>
      </div>
    </div>
  );
}
