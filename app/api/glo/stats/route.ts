import type { GloStatResult, LottoStats, DigitCount } from "@/lib/glo-types";

const GLO_BASE = "https://www.glo.or.th/api";

function toDigitCounts(entries: { number: string; count: number }[]): DigitCount[] {
  return [...entries]
    .map(e => ({ digit: e.number, count: e.count }))
    .sort((a, b) => b.count - a.count || a.digit.localeCompare(b.digit));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";

  try {
    const res = await fetch(`${GLO_BASE}/mission/getMissionStatsRewardPrevious`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(date ? { date } : {}),
    });
    if (!res.ok) throw new Error(`GLO ${res.status}`);
    const json = await res.json();
    const result: GloStatResult = json?.response?.result;
    if (!result) throw new Error("ไม่พบ result ใน response");

    const stats: LottoStats = {
      twoDigit: toDigitCounts(result["lottery-stat-suffix2"] ?? []),
      threeDigitSuffix: toDigitCounts(result["lottery-stat-suffix3"] ?? []),
      threeDigitPrefix: toDigitCounts(result["lottery-stat-prefix3"] ?? []),
      periodsAnalyzed: 0,
      dateRange: { from: "", to: "" },
    };

    return Response.json(stats);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
