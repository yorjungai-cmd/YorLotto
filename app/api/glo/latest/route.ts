const GLO_BASE = 'https://www.glo.or.th/api';

export async function GET() {
  try {
    const res = await fetch(`${GLO_BASE}/lottery/getLatestLottery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`GLO ${res.status}`);
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
