import type { GloLotteryResult, DigitCount, LottoStats } from './glo-types';

export function computeStats(results: GloLotteryResult[]): LottoStats {
  const twoDigitMap = new Map<string, number>();
  const threeDigitSuffixMap = new Map<string, number>();

  for (let i = 0; i <= 99; i++) {
    twoDigitMap.set(i.toString().padStart(2, '0'), 0);
  }

  for (const result of results) {
    for (const n of result.prizes.twoDigit?.number ?? []) {
      const key = n.padStart(2, '0');
      twoDigitMap.set(key, (twoDigitMap.get(key) ?? 0) + 1);
    }
    for (const n of result.prizes.threeDigitSuffix?.number ?? []) {
      const key = n.padStart(3, '0');
      threeDigitSuffixMap.set(key, (threeDigitSuffixMap.get(key) ?? 0) + 1);
    }
  }

  const sortDesc = (map: Map<string, number>): DigitCount[] =>
    [...map.entries()]
      .map(([digit, count]) => ({ digit, count }))
      .sort((a, b) => b.count - a.count || a.digit.localeCompare(b.digit));

  const dates = results.map(r => r.date).filter(Boolean);

  return {
    twoDigit: sortDesc(twoDigitMap),
    threeDigitSuffix: sortDesc(threeDigitSuffixMap),
    periodsAnalyzed: results.length,
    dateRange: {
      from: dates[dates.length - 1] ?? '',
      to: dates[0] ?? '',
    },
  };
}

export function getInsight(
  twoDigits: string,
  threeDigits: string,
  stats: LottoStats
): string {
  const two = stats.twoDigit.find(d => d.digit === twoDigits.padStart(2, '0'));
  if (!two) return `สุ่มจากเลข 0-9 โอกาสเท่ากัน`;

  const rank = stats.twoDigit.indexOf(two) + 1;
  const total = stats.twoDigit.length;
  const n = stats.periodsAnalyzed;

  if (rank <= 10) {
    return `🔥 เลขท้าย ${twoDigits} เป็นเลขร้อน อันดับ ${rank} ออก ${two.count} ครั้งใน ${n} งวด`;
  }
  if (rank > total - 10) {
    return `🧊 เลขท้าย ${twoDigits} เป็นเลขเย็น ออกเพียง ${two.count} ครั้งใน ${n} งวด`;
  }

  const three = stats.threeDigitSuffix.find(d => d.digit === threeDigits.padStart(3, '0'));
  if (three && three.count > 0) {
    return `เลขท้าย ${threeDigits} ออกมาแล้ว ${three.count} ครั้งใน ${n} งวดที่ผ่านมา`;
  }
  if (three && three.count === 0) {
    return `เลขท้าย ${threeDigits} ยังไม่เคยออกใน ${n} งวดที่ผ่านมา`;
  }

  return `เลขท้าย ${twoDigits} ออก ${two.count} ครั้งใน ${n} งวดที่ผ่านมา`;
}
