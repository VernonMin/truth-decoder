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


export interface EncodeResult {
  encoded: string;         // 职场化版本的报告
  buzzwords: string[];     // 使用的关键黑话（最多5个）
  professionalScore: number; // 1-5 逼格评分
  sarcasm: string;         // 毒舌点评
}

export interface Env {
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
}
