import type { DecodeResult } from '@/types';

interface Props {
  input: string;
  result: DecodeResult;
  truthCode: string;   // 例如 TK-A3F9KM
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
export default function TruthPoster({ input, result, truthCode, appUrl }: Props) {
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

        {/* 底部：真相码 + URL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ color: 'rgba(204,255,0,0.5)', fontSize: 10, marginBottom: 4 }}>
              专属真相码（赠好友免费解锁）
            </div>
            <div style={{ color: '#CCFF00', fontSize: 20, fontWeight: 700, letterSpacing: 3,
              textShadow: '0 0 8px #CCFF00' }}>
              {truthCode}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(204,255,0,0.5)', fontSize: 10, marginBottom: 4 }}>
              你的老板 PUA 等级是几星？
            </div>
            <div style={{ color: '#CCFF00', fontSize: 12 }}>
              {appUrl}
            </div>
          </div>
        </div>
      </div>

      {/* 底部黑条 */}
      <div style={{ background: '#0a0a0a', padding: '8px 24px', textAlign: 'center' }}>
        <span style={{ color: 'rgba(204,255,0,0.4)', fontSize: 10 }}>
          真相码 7 天有效 · 每码限用一次 · 仅供娱乐
        </span>
      </div>
    </div>
  );
}
