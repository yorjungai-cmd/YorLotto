import { computeStats } from '@/lib/stats-engine';
import type { GloLotteryResult } from '@/lib/glo-types';

const GLO_BASE = 'https://www.glo.or.th/api';

async function fetchPeriods(): Promise<{ date: string }[]> {
  const res = await fetch(`${GLO_BASE}/lottery/getPeriodList`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`GLO periods ${res.status}`);
  const data = await res.json();
  return data?.response?.periodList ?? [];
}

async function fetchResult(date: string): Promise<GloLotteryResult | null> {
  try {
    const res = await fetch(`${GLO_BASE}/checking/getLotteryResult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data?.response;
    if (!r) return null;
    return { date, prizes: r.prizes ?? r };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const periods = Math.min(36, Math.max(1, parseInt(url.searchParams.get('periods') ?? '12')));

  try {
    const allPeriods = await fetchPeriods();
    const selected = allPeriods.slice(0, periods);

    const results = await Promise.all(selected.map(p => fetchResult(p.date)));
    const valid = results.filter((r): r is GloLotteryResult => r !== null);

    return Response.json(computeStats(valid));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
