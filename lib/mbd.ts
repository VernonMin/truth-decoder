// 面包多 Pay API helpers
// Docs: https://mbd.pub/open_doc/#/
// Auth: x-token header (developer key from https://mbd.pub/o/config/developer)

// ── 查询订单状态 ──────────────────────────────────────────────
export async function queryMbdOrder(opts: {
  apiToken: string;
  outOrderId: string;
}): Promise<{ paid: boolean }> {
  const { apiToken, outOrderId } = opts;

  const res = await fetch(
    `https://x.mbd.pub/api/order-detail?out_order_id=${encodeURIComponent(outOrderId)}`,
    { headers: { 'x-token': apiToken } }
  );

  if (!res.ok) throw new Error(`面包多查单 HTTP ${res.status}`);

  const json = await res.json() as {
    code: number;
    msg?: string;
    result?: { state?: string };
    error_info?: string;
  };

  if (json.code !== 200) {
    // code 404 = 订单不存在（还没付款），不算错误
    if (json.code === 404) return { paid: false };
    throw new Error(`面包多查单 error: ${json.error_info ?? JSON.stringify(json)}`);
  }

  return { paid: json.result?.state === 'success' };
}

// ── 构造付款跳转 URL ──────────────────────────────────────────
export function buildPayUrl(productUrl: string, outOrderId: string): string {
  const url = new URL(productUrl);
  url.searchParams.set('out_order_id', outOrderId);
  return url.toString();
}
