import type { LottoStats } from './glo-types';

export interface DigitAnalysis {
  number: string;
  digitSum: number;
  reducedSum: number; // keep reducing until single digit
  sumMeaning: string;
  patterns: string[];
  auspicious: string[];
}

export interface NumberAnalysis {
  six: DigitAnalysis & { composition: string };
  three: DigitAnalysis & { statNote: string };
  two: DigitAnalysis & { statRank: number; statCount: number; statNote: string };
  stars: number; // 1–5
  headline: string;
}

// --- Thai numerology: single digit meaning -------------------------------

const DIGIT_MEANING: Record<number, string> = {
  1: 'ความเป็นผู้นำ ริเริ่มสิ่งใหม่',
  2: 'ความสมดุล คู่ค้าที่ดี',
  3: 'ความสร้างสรรค์ โชคจากความพยายาม',
  4: 'ความมั่นคง รากฐานแข็งแกร่ง',
  5: 'โอกาสใหม่ ความเปลี่ยนแปลงที่ดี',
  6: 'ความสามัคคี ความรักและครอบครัว',
  7: 'ปัญญา ความลึกซึ้ง ดวงดาว',
  8: 'ความมั่งคั่ง ความสำเร็จและทรัพย์สิน',
  9: 'ความสมบูรณ์ ความก้าวหน้า มหาโชค',
};

function digitSum(n: string): number {
  return n.split('').reduce((s, c) => s + +c, 0);
}

function reduceSum(n: number): number {
  while (n > 9) n = digitSum(String(n));
  return n;
}

// --- Pattern detection ---------------------------------------------------

function detectPatterns(n: string): string[] {
  const patterns: string[] = [];
  const digits = n.split('').map(Number);

  // เลขซ้ำ (all same digit)
  if (new Set(digits).size === 1) {
    patterns.push(`เลขซ้ำ ${n} — ตัวเลขทรงพลังทวีคูณ`);
  }

  // เลขคู่ (pair pattern in 2-digit or repeating pair in 6-digit)
  if (n.length === 2 && digits[0] === digits[1]) {
    patterns.push(`เลขคู่สม — พลังงานเสริมกัน`);
  }

  // เลขไต่บันได (ascending consecutive)
  let ascending = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) { ascending = false; break; }
  }
  if (ascending && digits.length >= 2) patterns.push('เลขไต่บันได — โชคเพิ่มขึ้นต่อเนื่อง');

  // เลขลงบันได (descending consecutive)
  let descending = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] - 1) { descending = false; break; }
  }
  if (descending && digits.length >= 2) patterns.push('เลขลดหลั่น — ปล่อยวางสู่ความสงบ');

  // เลขกระจก palindrome
  const rev = n.split('').reverse().join('');
  if (n === rev && n.length > 1) patterns.push('เลขกระจก — สมดุลทั้งสองด้าน');

  // contains 8 or 9
  if (digits.includes(8)) patterns.push('มีเลข 8 — มงคลแห่งทรัพย์สิน');
  if (digits.includes(9)) patterns.push('มีเลข 9 — มงคลแห่งความก้าวหน้า');

  return patterns;
}

// --- Auspicious notes per number type ------------------------------------

function sixDigitAuspicious(n: string): string[] {
  const notes: string[] = [];
  const digits = n.split('').map(Number);
  const sum = digits.reduce((s, d) => s + d, 0);
  const reduced = reduceSum(sum);

  notes.push(`ผลรวม ${sum} → ${reduced} (${DIGIT_MEANING[reduced] ?? ''})`);

  // Leading digit meaning
  const lead = digits[0];
  if (lead === 1) notes.push('หลักแรกคือ 1 — จุดเริ่มต้นที่แข็งแกร่ง');
  if (lead === 3 || lead === 6 || lead === 9) notes.push('หลักแรกเป็นทวีคูณของ 3 — มงคลหมู่');

  // Count of 8 and 9
  const eights = digits.filter(d => d === 8).length;
  const nines = digits.filter(d => d === 9).length;
  if (eights >= 2) notes.push(`มีเลข 8 ถึง ${eights} ตัว — ทรัพย์สินทบต้น`);
  if (nines >= 2) notes.push(`มีเลข 9 ถึง ${nines} ตัว — โชคทวีคูณ`);

  return notes;
}

function twoOrThreeAuspicious(n: string): string[] {
  const notes: string[] = [];
  const sum = reduceSum(digitSum(n));
  notes.push(`ผลรวมตัวเลข → ${sum} (${DIGIT_MEANING[sum] ?? ''})`);
  return notes;
}

// --- Stat lookup helpers -------------------------------------------------

function findTwoDigitStat(n: string, stats: LottoStats) {
  const key = n.padStart(2, '0');
  const entry = stats.twoDigit.find(d => d.digit === key);
  const rank = entry ? stats.twoDigit.indexOf(entry) + 1 : stats.twoDigit.length;
  const count = entry?.count ?? 0;
  return { rank, count, total: stats.twoDigit.length };
}

function findThreeDigitStat(n: string, stats: LottoStats): string {
  const key = n.padStart(3, '0');
  const entry = stats.threeDigitSuffix.find(d => d.digit === key);
  if (!entry) return 'ไม่มีข้อมูลสถิติ';
  if (entry.count === 0) return `ยังไม่เคยออกในสถิติที่บันทึก`;
  return `ออกมาแล้ว ${entry.count} ครั้ง`;
}

// --- Headline generator --------------------------------------------------

function buildHeadline(twoRank: number, twoTotal: number, stars: number, isQuantum: boolean): string {
  if (stars >= 5) return 'เลขชุดนี้มีพลังมงคลสูงมาก ✨';
  if (twoRank <= 5) return `เลข 2 ตัวท้ายเป็นอันดับ ${twoRank} จากสถิติ GLO`;
  if (twoRank > twoTotal - 10) return 'เลข 2 ตัวท้ายเป็นเลขเย็น — หายากในสถิติ';
  if (stars >= 4) return 'เลขชุดนี้มีรูปแบบมงคลน่าสนใจ';
  if (stars === 3) return 'เลขชุดนี้มีความสมดุลพอดี';
  return isQuantum ? 'เลขชุดนี้สุ่มโดยระบบ Quantum' : 'เลขชุดนี้สุ่มโดยระบบพื้นฐาน';
}

// --- Main export ---------------------------------------------------------

export function analyzeNumbers(
  sixDigits: string,
  threeDigits: string,
  twoDigits: string,
  stats?: LottoStats | null,
  isQuantum = false
): NumberAnalysis {
  const sixPatterns = detectPatterns(sixDigits);
  const threePatterns = detectPatterns(threeDigits);
  const twoPatterns = detectPatterns(twoDigits);

  const sixAusp = sixDigitAuspicious(sixDigits);
  const threeAusp = twoOrThreeAuspicious(threeDigits);
  const twoAusp = twoOrThreeAuspicious(twoDigits);

  const sixReduced = reduceSum(digitSum(sixDigits));
  const threeReduced = reduceSum(digitSum(threeDigits));
  const twoReduced = reduceSum(digitSum(twoDigits));

  // Stat lookup
  const twoStat = stats ? findTwoDigitStat(twoDigits, stats) : { rank: 50, count: 0, total: 100 };
  const threeStatNote = stats ? findThreeDigitStat(threeDigits, stats) : '';
  const twoStatNote = stats
    ? (twoStat.rank <= 10
        ? `🔥 เลขร้อน อันดับ ${twoStat.rank} — ออก ${twoStat.count} ครั้ง`
        : twoStat.rank > twoStat.total - 10
        ? `🧊 เลขเย็น — ออกเพียง ${twoStat.count} ครั้ง`
        : `ออก ${twoStat.count} ครั้งในสถิติสะสม`)
    : '';

  // Score: patterns, auspicious sums, stat rank
  let score = 0;
  if (sixReduced === 8 || sixReduced === 9) score += 2;
  else if (sixReduced === 3 || sixReduced === 6) score += 1;
  if (threeReduced === 8 || threeReduced === 9) score += 1;
  if (twoReduced === 8 || twoReduced === 9) score += 1;
  score += Math.min(2, sixPatterns.length + threePatterns.length + twoPatterns.length);
  if (stats && twoStat.rank <= 10) score += 1;
  const stars = Math.min(5, Math.max(1, Math.round(score / 1.6)));

  // Composition note for 6-digit
  const sixDigitsArr = sixDigits.split('').map(Number);
  const oddCount = sixDigitsArr.filter(d => d % 2 !== 0).length;
  const evenCount = 6 - oddCount;
  const composition = `เลขคี่ ${oddCount} ตัว · เลขคู่ ${evenCount} ตัว`;

  return {
    six: {
      number: sixDigits,
      digitSum: digitSum(sixDigits),
      reducedSum: sixReduced,
      sumMeaning: DIGIT_MEANING[sixReduced] ?? '',
      patterns: sixPatterns,
      auspicious: sixAusp,
      composition,
    },
    three: {
      number: threeDigits,
      digitSum: digitSum(threeDigits),
      reducedSum: threeReduced,
      sumMeaning: DIGIT_MEANING[threeReduced] ?? '',
      patterns: threePatterns,
      auspicious: threeAusp,
      statNote: threeStatNote,
    },
    two: {
      number: twoDigits,
      digitSum: digitSum(twoDigits),
      reducedSum: twoReduced,
      sumMeaning: DIGIT_MEANING[twoReduced] ?? '',
      patterns: twoPatterns,
      auspicious: twoAusp,
      statRank: twoStat.rank,
      statCount: twoStat.count,
      statNote: twoStatNote,
    },
    stars,
    headline: buildHeadline(twoStat.rank, twoStat.total, stars, isQuantum),
  };
}
