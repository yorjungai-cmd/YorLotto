import type { GloData, GloLotteryResult } from "@/lib/glo-types";

const GLO_BASE = "https://www.glo.or.th/api";

function normalizeResult(date: string, data: GloData): GloLotteryResult {
  const vals = (entry: GloData[keyof GloData]) =>
    entry?.number?.map(n => n.value) ?? [];

  return {
    date,
    prizes: {
      first: vals(data.first),
      twoDigit: vals(data.last2),
      threeDigitPrefix: vals(data.last3f),
      threeDigitSuffix: vals(data.last3b),
    },
  };
}

export async function GET() {
  try {
    const res = await fetch(`${GLO_BASE}/lottery/getLatestLottery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`GLO ${res.status}`);
    const json = await res.json();
    const r = json?.response;
    if (!r?.data) throw new Error("ไม่พบข้อมูลใน response");
    return Response.json(normalizeResult(r.date ?? "", r.data));
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
