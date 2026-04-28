# Yor Lotto

เว็บแอปสุ่มเลขนำโชคสำหรับสลากกินแบ่งรัฐบาลไทย พร้อมสถิติย้อนหลังจาก GLO และระบบสุ่มแบบถ่วงน้ำหนักจากข้อมูลจริง

## ฟีเจอร์

- **สุ่มเลข 3 รูปแบบ** — 6 หลัก, 3 ตัวท้าย, 2 ตัวท้าย ในครั้งเดียว
- **3 โหมดสุ่ม**
  - `สุ่มล้วน` — โอกาสเท่ากันทุกเลข
  - `ผสมวันเกิด` — ถ่วงน้ำหนักด้วย digit จากวันเกิด ค.ศ.
  - `✦ ชาญฉลาด` — ใช้สถิติ GLO จริง + penalty จากประวัติที่เคยสุ่ม
- **ผลรางวัลงวดล่าสุด** — ดึงข้อมูลจาก GLO โดยตรง
- **สถิติเลขร้อน / เลขเย็น** — วิเคราะห์ 2 ตัวและ 3 ตัวจาก GLO
- **Insight หลังสุ่ม** — บอกว่าเลขที่ได้ร้อนหรือเย็นแค่ไหน
- **ประวัติการสุ่ม** — เก็บ 20 รายการล่าสุดใน localStorage
- **ทดสอบ Connection GLO** — ตรวจสอบสถานะ API แต่ละ endpoint

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS (globals.css) |
| State | React useState / useEffect |
| Storage | Browser localStorage |
| Data | GLO Public API |
| Deploy | Vercel |

## โครงสร้างโปรเจกต์

```
app/
  page.tsx              หน้าหลัก (UI + state)
  layout.tsx            Layout และ fonts
  globals.css           Styles ทั้งหมด
  api/
    glo/
      latest/route.ts   Proxy ผลรางวัลล่าสุดจาก GLO
      stats/route.ts    สถิติ hot/cold จาก GLO
      debug/route.ts    ทดสอบ connection ทุก endpoint

lib/
  lotto-engine.ts       Algorithm สุ่มเลข (pure / birthday / smart)
  stats-engine.ts       คำนวณ hot/cold และ insight
  glo-types.ts          TypeScript types สำหรับ GLO API
  date-utils.ts         countdown ถึงงวดถัดไป
```

## Smart Mode Algorithm

โหมด `✦ ชาญฉลาด` ใช้หลายชั้นในการถ่วงน้ำหนัก:

1. **GLO Stat Weight** — pool 2-ตัว/3-ตัวถ่วงน้ำหนักตามความถี่จริง (`weight = 1 + count × 2`)
2. **Position Analysis** — 6-ตัวใช้ digit frequency แยกตามตำแหน่ง (หลักสิบ vs หลักหน่วย)
3. **History Penalty** — digit ที่ถูกสุ่มบ่อยใน 15 รายการล่าสุด ลดน้ำหนักเหลือ 30%
4. **Anti-repeat** — 2-ตัว/3-ตัวที่เพิ่งออก ลดน้ำหนักเหลือ 5%
5. **Birthday Bonus** — digit ตรงวันเกิดได้ multiplier 1.6×

## GLO API Endpoints ที่ใช้

| Endpoint | ใช้ทำอะไร |
|---|---|
| `POST /lottery/getLatestLottery` | ผลรางวัลงวดล่าสุด |
| `POST /lottery/getPeriodList` | รายการงวดย้อนหลัง |
| `POST /mission/getMissionStatsRewardPrevious` | สถิติความถี่ 2/3 ตัว |
| `POST /checking/getLotteryResult` | ผลรางวัลตามวันที่ (debug) |

> ข้อมูลทั้งหมดผ่าน Next.js API Routes เพื่อหลีกเลี่ยง CORS

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## ตรวจ Build ก่อน Deploy

```bash
npm run build
```

## Deploy บน Vercel

1. Push ขึ้น GitHub
2. เชื่อม repo กับ [vercel.com](https://vercel.com)
3. กด Deploy — ไม่ต้องตั้งค่า environment variable ใดๆ

## Data Privacy

- วันเกิดไม่ถูกส่งออกไปยัง server — ใช้เฉพาะ client-side
- ประวัติการสุ่มเก็บใน `localStorage` ของ browser เท่านั้น
- ไม่มี database, ไม่มี tracking, ไม่มี login

## หมายเหตุ

เว็บนี้ทำขึ้นเพื่อความบันเทิงเท่านั้น ไม่สามารถทำนายผลสลากได้จริง การสุ่มทุกรูปแบบใช้ `Math.random()` และสถิติประกอบการตัดสินใจ ไม่ใช่การพยากรณ์

## Roadmap

- [x] Phase 1 — สุ่มเลข 3 รูปแบบ, ประวัติ localStorage
- [x] Phase 2 — GLO API, สถิติ hot/cold, insight, smart mode
- [ ] Phase 3 — Firebase cache, ระบบ login, ประวัติข้ามเครื่อง
