const GLO_BASE = "https://www.glo.or.th/api";

interface TestResult {
  name: string;
  ok: boolean;
  status?: number;
  error?: string;
  preview?: unknown;
  latencyMs: number;
}

async function probe(name: string, url: string, body: object): Promise<TestResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const latencyMs = Date.now() - start;
    const json = await res.json();
    const preview = json?.response
      ? JSON.stringify(json.response).slice(0, 200)
      : json?.statusMessage;
    return { name, ok: res.ok && json?.status !== false, status: res.status, preview, latencyMs };
  } catch (err) {
    return { name, ok: false, error: String(err), latencyMs: Date.now() - start };
  }
}

export async function GET() {
  const results = await Promise.all([
    probe("getLatestLottery", `${GLO_BASE}/lottery/getLatestLottery`, {}),
    probe("getPeriodList", `${GLO_BASE}/lottery/getPeriodList`, {}),
    probe("getMissionStatsRewardPrevious", `${GLO_BASE}/mission/getMissionStatsRewardPrevious`, {}),
    probe("getLotteryResult (latest)", `${GLO_BASE}/checking/getLotteryResult`, { date: "2026-04-16" }),
  ]);
  return Response.json({ timestamp: new Date().toISOString(), results });
}
