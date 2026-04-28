<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Yor Lotto — Agent & Contributor Guide

## โครงสร้างโปรเจกต์

```
app/
  page.tsx              หน้าหลัก (client component — "use client")
  layout.tsx            Layout, fonts (IBM Plex Sans Thai, Material Symbols)
  globals.css           CSS ทั้งหมด ไม่มี CSS Modules / Tailwind
  api/
    glo/
      latest/route.ts   GET → proxy getLatestLottery
      stats/route.ts    GET ?date= → proxy getMissionStatsRewardPrevious
      debug/route.ts    GET → probe ทุก GLO endpoint พร้อม latency

lib/
  lotto-engine.ts       Algorithm สุ่มเลข — อ่านก่อนแก้ไขทุกครั้ง
  stats-engine.ts       computeStats(), getInsight()
  glo-types.ts          TypeScript types สำหรับ GLO API และ stats
  date-utils.ts         getRichCountdownText() — countdown งวดถัดไป
```

## GLO API — Response Structure จริง (ต่างจาก docs เก่า)

### `POST /lottery/getLatestLottery`
```json
{
  "response": {
    "date": "2026-04-16",
    "data": {
      "first":  { "number": [{ "round": 1, "value": "309612" }] },
      "last2":  { "number": [{ "round": 1, "value": "77" }] },
      "last3f": { "number": [{ "round": 1, "value": "355" }, ...] },
      "last3b": { "number": [{ "round": 1, "value": "868" }, ...] }
    }
  }
}
```
→ Route normalize เป็น `GloLotteryResult` ที่มี `prizes.{first,twoDigit,threeDigitPrefix,threeDigitSuffix}: string[]`

### `POST /lottery/getPeriodList`
```json
{ "response": { "list": ["2026-04-16", "2026-04-01", ...] } }
```

### `POST /mission/getMissionStatsRewardPrevious`
```json
{
  "response": {
    "result": {
      "lottery-stat-suffix2":  [{ "number": "77", "count": 5 }, ...],
      "lottery-stat-suffix3":  [{ "number": "868", "count": 3 }, ...],
      "lottery-stat-prefix3":  [{ "number": "355", "count": 2 }, ...]
    }
  }
}
```
> ⚠ `getLotteryResult` คืนค่า `response: null` สำหรับงวดที่ผ่านมา — ไม่ใช้ใน production

## Lotto Engine — Algorithm Layers (Quantum Mode)

เมื่อแก้ `lib/lotto-engine.ts` ต้องรักษา layer ทั้งหมดนี้ตามลำดับ:

1. **GLO Stat Weight** — `weight = 1 + count × 2`
2. **Birthday Bonus** — digit ตรงวันเกิด × 1.6
3. **Gender Alignment** — Male: คี่ × 1.5 / คู่ × 0.7 | Female: คู่ × 1.5 / คี่ × 0.7
4. **Position Amplifier** — Yang pos (0,2,4): Male ×1.4 | Yin pos (1,3,5): Female ×1.4
5. **History Penalty** — digit ที่ใช้บ่อยใน 15 รายการล่าสุด ลดเหลือ 0.3×
6. **Anti-repeat** — 2/3-ตัวที่เพิ่งออก ลดเหลือ 0.05×

สูตรสุดท้าย: `final = stat_weight × birthday × gender × position × penalty × anti_repeat`

## Types สำคัญ

```typescript
type LottoMode = 'pure' | 'smart'
type Gender    = 'male' | 'female'

interface GenerateOptions {
  stats?   : LottoStats
  history? : LottoResult[]
  birthday?: string
  gender?  : Gender
}
```

## Coding Rules

- **ไม่มี Tailwind** — ใช้ CSS classes ใน `globals.css` เท่านั้น
- **ไม่มี database** — state ทั้งหมดอยู่ใน React useState + localStorage
- **วันเกิดไม่ส่งออก server** — ใช้ client-side เท่านั้น
- Route Handlers ทุก route ต้อง handle error และคืน `{ error: string }` แทน throw
- Build ต้องผ่านก่อน push ทุกครั้ง: `npm run build`
- ไม่เพิ่ม dependency ใหม่โดยไม่จำเป็น

## ก่อนแก้ไข API Routes

1. ทดสอบ endpoint จริงด้วย `curl` ก่อนเสมอ
2. ดู response structure จาก `app/api/glo/debug/route.ts` เป็น reference
3. GLO API อาจเปลี่ยน structure โดยไม่แจ้ง — ตรวจสอบทุกครั้ง
