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

export interface Env {
  PAY_SESSIONS: KVNamespace;
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
  MIANBAODUO_WEBHOOK_SECRET: string;
  MIANBAODUO_APP_ID: string;
}
