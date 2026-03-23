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
  MBD_API_TOKEN: string;    // 面包多开发者密钥，从 https://mbd.pub/o/config/developer 获取
  MBD_PRODUCT_URL: string;  // 商品页面 URL，如 https://mbd.pub/o/bread/YZ2amZk=
}
