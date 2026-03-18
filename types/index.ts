export interface DecodeResult {
  translation: string;
  puaLevel: number;
  bossIntention: string;
  responses: {
    polite: string;
    crazy: string;
  };
  quote: string;
}

export interface PaySession {
  orderId: string;
  paidAt: number;
}

// 付款人生成的 Buddy Key，可赠送给一位好友使用
export interface BuddyKey {
  key: string;          // 8位随机码，例如 "TK-A3F9"
  ownerSessionId: string;
  ownerName: string;    // 付款人昵称（前端传入，用于 referral 展示）
  usedBySessionId: string | null;
  createdAt: number;
  usedAt: number | null;
}

export interface Env {
  PAY_SESSIONS: KVNamespace;
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
  MIANBAODUO_WEBHOOK_SECRET: string;
  MIANBAODUO_APP_ID: string;
}
