import type { LottoStats } from './glo-types';

export type LottoMode = 'pure' | 'birthday' | 'smart';
export type Gender = 'male' | 'female';

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
  birthday?: string;
  gender?: Gender;
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

// --- Gender weighting (เลขศาสตร์ไทย + yin/yang) --------------------------
//
// ชาย (Yang): ธาตุไฟ-ไม้ → เลขคี่ 1,3,5,7,9 คือเลขหยาง
//   ตำแหน่งคี่ (index 0,2,4) ในเลข 6 ตัว = ตำแหน่งหยาง → boost สูงสุด
// หญิง (Yin): ธาตุน้ำ-โลหะ → เลขคู่ 0,2,4,6,8 คือเลขหยิน
//   ตำแหน่งคู่ (index 1,3,5) = ตำแหน่งหยิน → boost สูงสุด

function genderDigitMultiplier(digit: number, gender: Gender, positionIndex?: number): number {
  const isOdd = digit % 2 !== 0;

  // Position modifier: yang positions (0,2,4) amplify male boost; yin positions (1,3,5) amplify female boost
  let posAmp = 1.0;
  if (positionIndex !== undefined) {
    const isYangPos = positionIndex % 2 === 0;
    if (gender === 'male' && isYangPos) posAmp = 1.4;
    else if (gender === 'female' && !isYangPos) posAmp = 1.4;
    else posAmp = 0.85;
  }

  const base = gender === 'male'
    ? (isOdd ? 1.5 : 0.7)
    : (isOdd ? 0.7 : 1.5);

  return base * posAmp;
}

// Apply gender multiplier to a digit-weight array (len 10), with optional position
function applyGenderToDigits(weights: number[], gender: Gender, positionIndex?: number): number[] {
  return weights.map((w, d) => w * genderDigitMultiplier(d, gender, positionIndex));
}

// Compute gender alignment multiplier for a whole number string (e.g. "47" or "312")
// Combined with GLO frequency: numbers that are gender-aligned AND historically frequent
// get the highest final weight
function genderAlignmentForNumber(numStr: string, gender: Gender): number {
  return numStr.split('').reduce((acc, ch) => {
    const d = +ch;
    const isOdd = d % 2 !== 0;
    const m = gender === 'male' ? (isOdd ? 1.5 : 0.7) : (isOdd ? 0.7 : 1.5);
    return acc * m;
  }, 1);
}

// --- Digit position weights from GLO 2-digit stats -----------------------

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
    if (ratio > 1.3) return Math.max(0.3, 1 - (ratio - 1) * 0.5);
    return 1.0;
  });
}

// --- Birthday bonus -------------------------------------------------------

function applyBirthdayBonus(weights: number[], birthdayDigits: string[], boost = 1.6): number[] {
  const result = [...weights];
  for (const d of birthdayDigits) {
    const idx = +d;
    if (idx >= 0 && idx <= 9) result[idx] *= boost;
  }
  return result;
}

// --- Build whole-number pools from GLO stats (with all layers) -----------

function buildPool(
  stats: { digit: string; count: number }[],
  birthdayDigits: string[],
  recentUsed: string[],
  useBirthday: boolean,
  gender?: Gender
): [string, number][] {
  return stats.map(({ digit, count }) => {
    let w = 1 + count * 2;

    // Layer 1: birthday digit matching
    if (useBirthday && birthdayDigits.length > 0) {
      const matches = digit.split('').filter(ch => birthdayDigits.includes(ch)).length;
      if (matches > 0) w *= 1 + matches * 0.4;
    }

    // Layer 2: gender alignment (cross-multiplied with GLO frequency)
    // Numbers that are gender-aligned AND historically frequent get the highest weight
    if (gender) {
      w *= genderAlignmentForNumber(digit, gender);
    }

    // Layer 3: anti-repeat
    if (recentUsed.includes(digit)) w *= 0.05;

    return [digit, w] as [string, number];
  });
}

// --- Smart 6-digit: position-aware with all weight layers ----------------

function smartSixDigits(
  posW: [number[], number[]],
  penalty: number[],
  birthdayDigits: string[],
  useBirthday: boolean,
  gender?: Gender
): string {
  const [tens, units] = posW;
  // Positions 0,2,4 = tens-pattern (yang positions); 1,3,5 = units-pattern (yin positions)
  const positionCycle: [number[], number][] = [
    [tens, 0], [units, 1], [tens, 2], [units, 3], [tens, 4], [units, 5],
  ];

  let result = '';
  for (const [base, posIdx] of positionCycle) {
    let w = base.map((b, i) => b * penalty[i]);
    if (useBirthday) w = applyBirthdayBonus(w, birthdayDigits);
    if (gender) w = applyGenderToDigits(w, gender, posIdx);
    result += weightedPick(w).toString();
  }
  return result;
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

// --- Main export ---------------------------------------------------------

export function generateLotto(
  mode: LottoMode = 'pure',
  birthday = '',
  count = 1,
  options: GenerateOptions = {}
): LottoResult[] {
  const { stats, history = [], gender } = options;
  const birthdayDigits = birthday.replace(/[^0-9]/g, '').split('').filter(Boolean);
  const useBirthday = birthdayDigits.length > 0;
  const results: LottoResult[] = [];

  const smartMode = mode === 'smart' && !!stats;

  const posW = smartMode ? positionWeights(stats!.twoDigit) : null;
  const penalty = smartMode ? historyPenalty(history) : null;
  const recentTwo = history.slice(0, 10).map(r => r.twoDigits);
  const recentThree = history.slice(0, 10).map(r => r.threeDigits);

  const twoPool = smartMode
    ? buildPool(stats!.twoDigit, birthdayDigits, recentTwo, useBirthday, gender)
    : null;

  const threePool = smartMode
    ? buildPool(
        stats!.threeDigitSuffix.filter(d => d.count > 0).slice(0, 200),
        birthdayDigits,
        recentThree,
        useBirthday,
        gender
      )
    : null;

  for (let i = 0; i < count; i++) {
    let twoDigits: string;
    let threeDigits: string;
    let sixDigits: string;

    if (smartMode) {
      twoDigits = weightedPickStr(twoPool!);
      threeDigits = threePool!.length > 0 ? weightedPickStr(threePool!) : pureThreeDigits();
      sixDigits = smartSixDigits(posW!, penalty!, birthdayDigits, useBirthday, gender);
    } else {
      twoDigits = pureTwoDigits();
      threeDigits = pureThreeDigits();
      sixDigits = pureSixDigits();
    }

    results.push({ sixDigits, threeDigits, twoDigits, timestamp: Date.now(), mode });
  }

  return results;
}
