import type { Gender } from './lotto-engine';

export interface GoldenTimeResult {
  startTime: string;
  endTime: string;
  luckScore: number;  // 0–100
  yamName: string;
  insight: string;
  timeReason: string;
}

// 8 ช่วงยาม 06:00–18:00 (ช่วงละ 90 นาที)
const YAMS = [
  { start: '06:00', end: '07:30', name: 'ยามอาทิตย์', planet: 'อาทิตย์' },
  { start: '07:30', end: '09:00', name: 'ยามจันทร์',  planet: 'จันทร์'  },
  { start: '09:00', end: '10:30', name: 'ยามอังคาร', planet: 'อังคาร'  },
  { start: '10:30', end: '12:00', name: 'ยามพุธ',    planet: 'พุธ'     },
  { start: '12:00', end: '13:30', name: 'ยามพฤหัส', planet: 'พฤหัส'   },
  { start: '13:30', end: '15:00', name: 'ยามศุกร์',  planet: 'ศุกร์'   },
  { start: '15:00', end: '16:30', name: 'ยามเสาร์',  planet: 'เสาร์'   },
  { start: '16:30', end: '18:00', name: 'ยามราหู',   planet: 'ราหู'    },
];

// insight ตาม reducedSum ของเลข 6 หลัก
const SUM_INSIGHTS: Record<number, string> = {
  1: 'พลังงานเลข 1 เน้นการริเริ่ม — ซื้อช่วงเปิดยามจะได้รับพลังงานแห่งการเริ่มต้น',
  2: 'เลข 2 คือพลังคู่ — ช่วงเวลาที่ดาวคู่โคจรตรงกันเสริมโชคลาภ',
  3: 'ผลรวมเลข 3 สร้างสรรค์ — ยามที่ดาวเคลื่อนสู่ตำแหน่งมงคลเสริมความพยายาม',
  4: 'เลข 4 มั่นคง — เลือกยามที่มีรากฐานแข็งแกร่งเพื่อรับพลังงานที่ยั่งยืน',
  5: 'พลังงาน 5 คือการเปลี่ยนแปลง — ยามเปลี่ยนผ่านระหว่างดาวคือโอกาสทอง',
  6: 'เลข 6 สามัคคี — ช่วงที่ดาวสัมพันธ์กันเสริมพลังครอบครัวและความรัก',
  7: 'ปัญญาเลข 7 — ยามดาวพฤหัสสดชื่นเป็นช่วงที่ดวงชะตาเปิดกว้าง',
  8: 'มงคลเลข 8 แห่งทรัพย์สิน — ยามดาวเสาร์อยู่ในทิศที่เกื้อหนุนเลขที่มีเลข 8',
  9: 'มหาโชคเลข 9 — ดาวพฤหัสบดีอยู่ในทิศดี จะนำพาซึ่งลาภลอยก้อนโตในช่วงยามนี้',
};

function reduceSum(n: number): number {
  while (n > 9) n = String(n).split('').reduce((s, c) => s + +c, 0);
  return n;
}

function digitSum(s: string): number {
  return s.split('').reduce((acc, c) => acc + +c, 0);
}

export function computeGoldenTime(
  sixDigits: string,
  twoDigits: string,
  birthday?: string,
  gender?: Gender,
): GoldenTimeResult {
  const sixReduced = reduceSum(digitSum(sixDigits));
  const twoReduced = reduceSum(digitSum(twoDigits));

  // --- Base slot from digit sum (1–9 → 0–7) ---
  let slot = (sixReduced - 1) % 8;

  // --- Birthday shift ---
  let birthdayAligned = false;
  if (birthday) {
    const day = new Date(birthday).getDate();
    const shift = day % 8;
    slot = (slot + shift) % 8;
    // Check if birth day's reduced digit matches sixReduced
    birthdayAligned = reduceSum(day) === sixReduced;
  }

  // --- Gender alignment ---
  // Yang (male) = odd slots (1,3,5,7), Yin (female) = even slots (0,2,4,6)
  let genderAligned = false;
  if (gender) {
    const isOddSlot = slot % 2 === 1;
    const wantOdd = gender === 'male';
    if (wantOdd !== isOddSlot) {
      // Nudge to nearest aligned slot, pick direction that keeps us closest
      const prev = (slot + 7) % 8;
      const next = (slot + 1) % 8;
      slot = (wantOdd === (prev % 2 === 1)) ? prev : next;
    }
    genderAligned = true;
  }

  // --- Luck score ---
  let score = 60;
  if (sixReduced === 8 || sixReduced === 9) score += 15;
  else if (sixReduced === 3 || sixReduced === 6) score += 8;
  if (twoReduced === 8 || twoReduced === 9) score += 10;
  if (birthdayAligned) score += 10;
  if (genderAligned) score += 5;
  score = Math.min(95, score);

  // --- Time reason ---
  const yam = YAMS[slot];
  const genderNote = gender
    ? (gender === 'male' ? ' ตรงกับตำแหน่งหยาง (Yang) เสริมพลังชาย' : ' ตรงกับตำแหน่งหยิน (Yin) เสริมพลังหญิง')
    : '';
  const timeReason = `${yam.name} (ดาว${yam.planet})${genderNote}`;

  const insight = SUM_INSIGHTS[sixReduced] ?? 'ช่วงเวลานี้ดาวโคจรอยู่ในทิศที่เกื้อหนุนเลขชุดนี้เป็นพิเศษ';

  return {
    startTime: yam.start,
    endTime: yam.end,
    luckScore: score,
    yamName: yam.name,
    insight,
    timeReason,
  };
}
