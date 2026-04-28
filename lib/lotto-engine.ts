import type { LottoStats } from './glo-types';

export type LottoMode = 'pure' | 'birthday' | 'smart';

export interface LottoResult {
  sixDigits: string;
  threeDigits: string;
  twoDigits: string;
  timestamp: number;
  mode: LottoMode;
}

export interface GenerateOptions {
  stats?: LottoStats;
  history?: LottoResult[];
}

// --- Core weighted random -------------------------------------------------

function weightedPick(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  if (total === 0) return Math.floor(Math.random() * weights.length);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function weightedPickStr<T extends string>(pool: [T, number][]): T {
  const total = pool.reduce((s, [, w]) => s + w, 0);
  if (total === 0) return pool[Math.floor(Math.random() * pool.length)][0];
  let r = Math.random() * total;
  for (const [val, w] of pool) {
    r -= w;
    if (r <= 0) return val;
  }
  return pool[pool.length - 1][0];
}

// --- Digit position weights from GLO 2-digit stats -----------------------
// Returns two arrays of length 10: weights for tens-place and units-place

function positionWeights(twoDigitStats: LottoStats['twoDigit']): [number[], number[]] {
  const tens = new Array(10).fill(1.0);
  const units = new Array(10).fill(1.0);
  for (const { digit, count } of twoDigitStats) {
    tens[+digit[0]] += count;
    units[+digit[1]] += count;
  }
  return [tens, units];
}

// --- History penalty: digits used too often recently get reduced weight --

function historyPenalty(history: LottoResult[]): number[] {
  const freq = new Array(10).fill(0);
  const recent = history.slice(0, 15).map(r => r.sixDigits).join('');
  if (!recent) return new Array(10).fill(1.0);
  for (const ch of recent) freq[+ch] = (freq[+ch] ?? 0) + 1;
  const avg = recent.length / 10;
  return freq.map(f => {
    const ratio = f / avg;
    // Scale: overused digits (ratio > 1.3) get penalty down to 0.3×
    if (ratio > 1.3) return Math.max(0.3, 1 - (ratio - 1) * 0.5);
    return 1.0;
  });
}

// --- Birthday bonus: birthday digits get boosted weight ------------------

function applyBirthdayBonus(weights: number[], birthdayDigits: string[], boost = 1.6): number[] {
  const result = [...weights];
  for (const d of birthdayDigits) {
    const idx = +d;
    if (idx >= 0 && idx <= 9) result[idx] *= boost;
  }
  return result;
}

// --- Build whole-number pools from GLO stats -----------------------------

function buildPool(
  stats: { digit: string; count: number }[],
  birthdayDigits: string[],
  recentUsed: string[],
  useBirthday: boolean
): [string, number][] {
  return stats.map(({ digit, count }) => {
    let w = 1 + count * 2;

    // Birthday: boost numbers that share digits with birthday
    if (useBirthday && birthdayDigits.length > 0) {
      const matches = digit.split('').filter(ch => birthdayDigits.includes(ch)).length;
      if (matches > 0) w *= 1 + matches * 0.4;
    }

    // Anti-repeat: heavily reduce weight of recently generated numbers
    if (recentUsed.includes(digit)) w *= 0.05;

    return [digit, w] as [string, number];
  });
}

// --- Pure random helpers -------------------------------------------------

function pureTwoDigits() {
  return Math.floor(Math.random() * 100).toString().padStart(2, '0');
}

function pureThreeDigits() {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

function pureSixDigits() {
  return Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
}

// --- Smart 6-digit from position weights ---------------------------------

function smartSixDigits(
  posW: [number[], number[]],
  penalty: number[],
  birthdayDigits: string[],
  useBirthday: boolean
): string {
  const [tens, units] = posW;
  const positionCycle = [tens, units, tens, units, tens, units];
  let result = '';
  for (const base of positionCycle) {
    let w = base.map((b, i) => b * penalty[i]);
    if (useBirthday) w = applyBirthdayBonus(w, birthdayDigits);
    result += weightedPick(w).toString();
  }
  return result;
}

// --- Birthday mode (original improved) -----------------------------------

function birthdayNumber(length: number, birthdayDigits: string[]): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const useB = birthdayDigits.length > 0 && Math.random() < 0.45;
    result += useB
      ? birthdayDigits[Math.floor(Math.random() * birthdayDigits.length)]
      : Math.floor(Math.random() * 10).toString();
  }
  return result;
}

// --- Main export ---------------------------------------------------------

export function generateLotto(
  mode: LottoMode = 'pure',
  birthday = '',
  count = 1,
  options: GenerateOptions = {}
): LottoResult[] {
  const { stats, history = [] } = options;
  const birthdayDigits = birthday.replace(/[^0-9]/g, '').split('').filter(Boolean);
  const useBirthday = birthdayDigits.length > 0;
  const results: LottoResult[] = [];

  // Smart mode needs stats
  const smartMode = mode === 'smart' && !!stats;

  // Precompute for smart mode
  const posW = smartMode ? positionWeights(stats!.twoDigit) : null;
  const penalty = smartMode ? historyPenalty(history) : null;
  const recentTwo = history.slice(0, 10).map(r => r.twoDigits);
  const recentThree = history.slice(0, 10).map(r => r.threeDigits);

  const twoPool = smartMode
    ? buildPool(stats!.twoDigit, birthdayDigits, recentTwo, useBirthday)
    : null;

  const threePool = smartMode
    ? buildPool(
        stats!.threeDigitSuffix.filter(d => d.count > 0).slice(0, 200),
        birthdayDigits,
        recentThree,
        useBirthday
      )
    : null;

  for (let i = 0; i < count; i++) {
    let twoDigits: string;
    let threeDigits: string;
    let sixDigits: string;

    if (smartMode) {
      twoDigits = weightedPickStr(twoPool!);
      threeDigits = threePool!.length > 0 ? weightedPickStr(threePool!) : pureThreeDigits();
      sixDigits = smartSixDigits(posW!, penalty!, birthdayDigits, useBirthday);
    } else if (mode === 'birthday') {
      twoDigits = birthdayNumber(2, birthdayDigits);
      threeDigits = birthdayNumber(3, birthdayDigits);
      sixDigits = birthdayNumber(6, birthdayDigits);
    } else {
      twoDigits = pureTwoDigits();
      threeDigits = pureThreeDigits();
      sixDigits = pureSixDigits();
    }

    results.push({ sixDigits, threeDigits, twoDigits, timestamp: Date.now(), mode });
  }

  return results;
}
