import type { DecodeResult, EncodeResult } from '@/types';

// ——— 解密模式海报（3:4 = 600×800） ———

interface Props {
  input: string;
  result: DecodeResult;
  appUrl: string;
  qrDataUrl?: string;
}

const PUA_LABEL: Record<number, string> = {
  1: '轻微不适',
  2: '有点恶心',
  3: '明显PUA',
  4: '严重控制',
  5: '极度危险',
};

export default function TruthPoster({ input, result, appUrl, qrDataUrl }: Props) {
  return (
    <div style={{
      width: 600,
      height: 800,
      background: '#FFF5FB',
      fontFamily: 'Nunito, Noto Sans SC, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 顶部：模式名称警示条 */}
      <div style={{
        background: '#FF6EB4',
        padding: '11px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>
          🌸 解密模式 · TRUTH CERTIFICATE
        </span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
          职场黑话翻译站
        </span>
      </div>

      {/* 中间主体：对比文本区域 */}
      <div style={{
        flex: 1,
        padding: '18px 20px',
        border: '2px solid #F9C8E0',
        margin: '0 14px',
        borderRadius: 16,
        marginTop: 14,
        marginBottom: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        overflow: 'hidden',
        background: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(255,110,180,0.1)',
      }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', paddingBottom: 4 }}>
          <div style={{ color: '#FF6EB4', fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
            职场黑话翻译站
          </div>
          <div style={{ color: 'rgba(255,110,180,0.5)', fontSize: 10, marginTop: 3 }}>
            撕碎职场假面，还你人间清醒
          </div>
        </div>

        {/* 原文 vs 翻译 对比 */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {/* 左：原文 */}
          <div style={{ flex: 1, background: '#FFF5FB', border: '1px solid rgba(251,113,133,0.3)',
            borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ color: '#FB7185', fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>
              原文黑话
            </div>
            <div style={{ color: 'rgba(45,27,105,0.75)', fontSize: 12, lineHeight: 1.6,
              overflow: 'hidden', maxHeight: 80 }}>
              {input.slice(0, 60)}{input.length > 60 ? '...' : ''}
            </div>
          </div>
          {/* 右：翻译 */}
          <div style={{ flex: 1, background: '#FFF5FB', border: '2px solid #FF6EB4',
            borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ color: '#FF6EB4', fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>
              ✨ 人话翻译
            </div>
            <div style={{ color: '#2D1B69', fontSize: 13, fontWeight: 700, lineHeight: 1.6,
              overflow: 'hidden', maxHeight: 80 }}>
              {result.translation}
            </div>
          </div>
        </div>

        {/* PUA 等级 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ color: 'rgba(255,110,180,0.6)', fontSize: 11 }}>PUA 等级</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ fontSize: 16, color: i < result.puaLevel ? '#FB7185' : '#F9C8E0' }}>★</span>
            ))}
          </div>
          <span style={{ color: '#FB7185', fontSize: 11, fontWeight: 700 }}>
            {PUA_LABEL[result.puaLevel] ?? ''}
          </span>
        </div>

        {/* 老板心机 */}
        <div style={{ background: '#FFF5FB', border: '1px solid #F9C8E0',
          borderRadius: 12, padding: '10px 12px', flex: 1, overflow: 'hidden' }}>
          <div style={{ color: 'rgba(255,110,180,0.6)', fontSize: 9, fontWeight: 700,
            letterSpacing: 1, marginBottom: 6 }}>
            老板心机
          </div>
          <div style={{ color: 'rgba(45,27,105,0.75)', fontSize: 12, lineHeight: 1.65,
            overflow: 'hidden' }}>
            {result.bossIntention.slice(0, 120)}{result.bossIntention.length > 120 ? '...' : ''}
          </div>
        </div>

        {/* 动态金句 */}
        <div style={{ background: '#FF6EB4', borderRadius: 12, padding: '12px 16px',
          textAlign: 'center', flexShrink: 0 }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>
            {result.quote}
          </div>
        </div>
      </div>

      {/* 底部：URL（左） + 水豚判官（居中） + 二维码（右） */}
      <div style={{
        height: 88,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* 左：URL */}
        <div>
          <div style={{ color: 'rgba(255,110,180,0.5)', fontSize: 9, marginBottom: 2 }}>
            你的老板 PUA 几星？
          </div>
          <div style={{ color: 'rgba(255,110,180,0.7)', fontSize: 10 }}>{appUrl}</div>
        </div>

        {/* 中：水豚判官 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>🦛⚖️</div>
          <div style={{ color: '#FF6EB4', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>水豚判官</div>
        </div>

        {/* 右：二维码 */}
        {qrDataUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 60, height: 60, backgroundImage: `url(${qrDataUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: 8 }} />
            <span style={{ color: 'rgba(255,110,180,0.5)', fontSize: 8 }}>扫码翻译黑话</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ——— 加密模式海报（3:4 = 600×800，可爱粉紫风） ———

interface EncodePosterProps {
  input: string;
  result: EncodeResult;
  appUrl: string;
  qrDataUrl?: string;
  sector?: string;
}

const SCORE_LABEL: Record<number, string> = {
  1: '白话加工版',
  2: '初级打工人',
  3: '资深职场人',
  4: '准中层干部',
  5: 'MBA附体',
};

const SECTOR_LABEL: Record<string, string> = {
  tech: '🖥️ 大厂风',
  gov: '📋 体制内风',
  mnc: '👔 外企风',
};

export function EncodePoster({ input, result, appUrl, qrDataUrl, sector = 'tech' }: EncodePosterProps) {
  return (
    <div style={{
      width: 600,
      height: 800,
      background: '#FFF5FB',
      fontFamily: 'Nunito, Noto Sans SC, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 顶部：模式名称 */}
      <div style={{
        background: '#A78BFA',
        padding: '11px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>
          ✨ 加密模式 · ENCODE CERTIFICATE
        </span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 700 }}>
          {SECTOR_LABEL[sector] ?? '互联网风'}
        </span>
      </div>

      {/* 中间主体：对比文本 */}
      <div style={{
        flex: 1,
        padding: '18px 20px',
        border: '2px solid #F9C8E0',
        margin: '14px 14px 0',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        overflow: 'hidden',
        background: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(167,139,250,0.1)',
      }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', paddingBottom: 4 }}>
          <div style={{ color: '#A78BFA', fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
            职场话术加密站
          </div>
          <div style={{ color: 'rgba(167,139,250,0.6)', fontSize: 10, marginTop: 3 }}>
            白话变黑话，让老板看不懂你有多闲
          </div>
        </div>

        {/* 原文 vs 加密版 对比 */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {/* 左：原文 */}
          <div style={{ flex: 1, background: '#FFF5FB', border: '1px solid #F9C8E0',
            borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ color: 'rgba(167,139,250,0.7)', fontSize: 9, fontWeight: 700,
              letterSpacing: 1, marginBottom: 5 }}>
              原文（真实版）
            </div>
            <div style={{ color: 'rgba(45,27,105,0.55)', fontSize: 12, lineHeight: 1.6,
              fontStyle: 'italic', overflow: 'hidden', maxHeight: 80 }}>
              {input.slice(0, 60)}{input.length > 60 ? '...' : ''}
            </div>
          </div>
          {/* 右：加密版 */}
          <div style={{ flex: 1, background: '#FFF5FB', border: '2px solid #A78BFA',
            borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ color: '#A78BFA', fontSize: 9, fontWeight: 700,
              letterSpacing: 1, marginBottom: 5 }}>
              ⚡ 加密版
            </div>
            <div style={{ color: '#2D1B69', fontSize: 12, fontWeight: 600, lineHeight: 1.6,
              overflow: 'hidden', maxHeight: 80 }}>
              {result.encoded.slice(0, 80)}{result.encoded.length > 80 ? '...' : ''}
            </div>
          </div>
        </div>

        {/* 关键黑话标签 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
          {result.buzzwords.slice(0, 5).map((word, i) => (
            <span key={i} style={{
              background: 'rgba(255,110,180,0.08)',
              border: '1px solid rgba(255,110,180,0.35)',
              borderRadius: 8,
              padding: '3px 9px',
              color: '#FF6EB4',
              fontSize: 11,
              fontWeight: 700,
            }}>
              #{word}
            </span>
          ))}
        </div>

        {/* 逼格评分 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ color: 'rgba(167,139,250,0.7)', fontSize: 11 }}>逼格等级</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ fontSize: 16, color: i < result.professionalScore ? '#A78BFA' : '#F9C8E0' }}>★</span>
            ))}
          </div>
          <span style={{ color: '#A78BFA', fontSize: 11, fontWeight: 700 }}>
            {SCORE_LABEL[result.professionalScore] ?? ''}
          </span>
        </div>

        {/* 完整加密版 */}
        <div style={{ background: '#FFF5FB', border: '1px solid #F9C8E0',
          borderRadius: 12, padding: '10px 12px', flex: 1, overflow: 'hidden' }}>
          <div style={{ color: 'rgba(167,139,250,0.6)', fontSize: 9, fontWeight: 700,
            letterSpacing: 1, marginBottom: 6 }}>
            完整加密版
          </div>
          <div style={{ color: 'rgba(45,27,105,0.8)', fontSize: 11, lineHeight: 1.7,
            overflow: 'hidden' }}>
            {result.encoded.slice(0, 200)}{result.encoded.length > 200 ? '...' : ''}
          </div>
        </div>

        {/* 毒舌点评（动态金句） */}
        <div style={{ background: '#FF6EB4', borderRadius: 12, padding: '12px 16px',
          textAlign: 'center', flexShrink: 0 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>
            {result.sarcasm}
          </div>
        </div>
      </div>

      {/* 底部：URL（左） + 水豚判官（居中） + 二维码（右） */}
      <div style={{
        height: 88,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* 左：URL */}
        <div>
          <div style={{ color: 'rgba(255,110,180,0.5)', fontSize: 9, marginBottom: 2 }}>
            你的报告也能职场化？
          </div>
          <div style={{ color: 'rgba(255,110,180,0.7)', fontSize: 10 }}>{appUrl}</div>
        </div>

        {/* 中：水豚判官 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>🦛⚖️</div>
          <div style={{ color: '#FF6EB4', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>水豚判官</div>
        </div>

        {/* 右：二维码 */}
        {qrDataUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 60, height: 60, backgroundImage: `url(${qrDataUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', borderRadius: 8 }} />
            <span style={{ color: 'rgba(255,110,180,0.5)', fontSize: 8 }}>扫码加密报告</span>
          </div>
        )}
      </div>
    </div>
  );
}
