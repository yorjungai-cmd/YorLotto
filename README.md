# Yor Lotto

Yor Lotto คือเว็บแอปสุ่มเลขนำโชคสำหรับสลากกินแบ่งรัฐบาลไทย ที่ออกแบบมาให้ “กดครั้งเดียว ได้เลขครบชุด” พร้อมดูสถิติจริงจาก GLO ในประสบการณ์ที่ใช้งานง่าย เร็ว และไม่ต้องสมัครสมาชิก

ผู้ใช้สามารถสุ่มเลข 6 หลัก, 3 ตัวท้าย, และ 2 ตัวท้ายได้ทันที เลือกได้ทั้งโหมด `Normal` สำหรับการสุ่มล้วน และโหมด `✦ Quantum` ที่นำสถิติย้อนหลัง, ประวัติการสุ่ม, วันเกิด, และเพศมาช่วยถ่วงน้ำหนักเพื่อสร้างเลขที่มีคาแรกเตอร์มากขึ้น

## Why Yor Lotto

- สุ่มเลขครบ 3 รูปแบบในครั้งเดียว
- ดูผลงวดล่าสุดและสถิติเลขร้อน / เลขเย็นได้ในหน้าเดียว
- มี Quantum mode สำหรับคนที่อยากได้เลขแบบ “มีเรื่องเล่า” มากกว่าสุ่มล้วน
- ใช้งานได้เลยบน browser โดยไม่ต้อง login
- เก็บวันเกิดและประวัติการสุ่มไว้ฝั่ง client เท่านั้น

## Product Highlights

### 1. One-Tap Lucky Pick

กดสุ่มครั้งเดียวแล้วได้ผลลัพธ์ครบทั้ง:

- เลข 6 หลัก
- เลข 3 ตัวท้าย
- เลข 2 ตัวท้าย

รองรับการสุ่มทีละ `1`, `5`, หรือ `10` ชุด เพื่อให้เลือกเลขได้เร็วขึ้น

### 2. Two Modes, Two Feelings

| โหมด | เหมาะกับใคร | การทำงาน |
|---|---|---|
| `Normal` | คนที่อยากสุ่มแบบตรงไปตรงมา | สุ่มทุกหลักด้วย `Math.random()` |
| `✦ Quantum` | คนที่อยากได้เลขที่มีบริบทเพิ่มขึ้น | ถ่วงน้ำหนักด้วยสถิติ GLO, ประวัติ, วันเกิด, และเพศ |

หมายเหตุ: ใน engine ยังมี type `birthday` คงไว้เพื่อ backward compatibility แต่ไม่ได้เปิดเป็นโหมดใน UI ปัจจุบัน

### 3. Real GLO Context

Yor Lotto ไม่ได้เป็นแค่ตัวสุ่มเลข แต่ยังช่วยให้ผู้ใช้ตัดสินใจจากบริบทจริง:

- แสดงผลรางวัลงวดล่าสุดจาก GLO
- แสดงสถิติเลขร้อน / เลขเย็นของ 2 ตัวท้ายและ 3 ตัวท้าย
- มี insight ใต้ผลลัพธ์แต่ละชุดว่าเลขที่ได้ “ร้อน”, “เย็น”, หรือ “เคยออกมาแล้วกี่ครั้ง”

### 4. Privacy First by Default

- วันเกิดและเพศใช้เฉพาะฝั่ง browser
- ประวัติการสุ่มเก็บใน `localStorage`
- ไม่มี database
- ไม่มีระบบ login

## Quantum Mode at a Glance

สำหรับผู้ใช้ Quantum mode คือการสุ่มที่ “มีน้ำหนักมากกว่าความบังเอิญล้วน” โดยระบบจะเรียงชั้นการคำนวณประมาณนี้:

1. `GLO Stat Weight` ใช้น้ำหนัก `1 + count × 2`
2. `Birthday Bonus` digit ที่ตรงกับวันเกิดจะได้โบนัสเพิ่ม
3. `Gender Alignment` ชายเน้นเลขคี่, หญิงเน้นเลขคู่
4. `Position Amplifier` เลข 6 หลักมีการเพิ่มแรงถ่วงตามตำแหน่ง Yang/Yin
5. `History Penalty` digit ที่โผล่บ่อยใน 15 รายการล่าสุดจะถูกลดน้ำหนัก
6. `Anti-repeat` เลข 2 ตัว / 3 ตัวที่เพิ่งสุ่มซ้ำจะถูกลดน้ำหนักอย่างแรง

สรุปแบบสั้น:

- เลข 2 ตัวและ 3 ตัวสุ่มจาก weighted pool ที่อิงสถิติจริง
- เลข 6 หลักสุ่มแบบแยกตำแหน่ง โดยใช้ pattern จากสถิติ 2 ตัวมาช่วยกระจายน้ำหนัก
- ถ้าโหลดสถิติ GLO ไม่สำเร็จ ระบบจะ fallback ไปสุ่มแบบ `Normal`

## Experience Flow

```text
เปิดเว็บ
  -> โหลดผลงวดล่าสุด + สถิติ GLO
  -> เลือก Normal หรือ ✦ Quantum
  -> ใส่วันเกิด / เพศ ถ้าต้องการ
  -> เลือกจำนวนชุด
  -> กดสุ่ม
  -> ได้เลขพร้อม insight และบันทึกประวัติอัตโนมัติ
```

## Tech Snapshot

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | CSS ใน `globals.css` |
| State | React `useState` / `useEffect` |
| Storage | Browser `localStorage` |
| Data Source | GLO Public API |
| Deploy | Vercel |

## Architecture

```text
Browser UI
  -> /api/glo/latest   -> GLO getLatestLottery
  -> /api/glo/stats    -> GLO getMissionStatsRewardPrevious
  -> /api/glo/debug    -> probe หลาย endpoint เพื่อเช็กสถานะ
```

ทุกการเรียก GLO วิ่งผ่าน route handlers เพื่อหลีกเลี่ยง CORS และ normalize response ก่อนส่งกลับหน้าเว็บ

## Project Structure

```text
app/
  page.tsx              หน้า UI หลักและ client state ทั้งหมด
  layout.tsx            layout, metadata, fonts
  globals.css           CSS ทั้งโปรเจกต์
  api/glo/
    latest/route.ts     proxy ผลรางวัลงวดล่าสุด
    stats/route.ts      proxy สถิติเลขย้อนหลัง
    debug/route.ts      probe endpoint ของ GLO พร้อม latency

lib/
  lotto-engine.ts       logic สุ่มเลขและ weighted algorithm
  stats-engine.ts       insight สำหรับผลที่สุ่มได้
  glo-types.ts          types ของข้อมูล GLO ที่ normalize แล้ว
  date-utils.ts         helper ข้อความ countdown ถึงงวดถัดไป
```

## GLO Endpoints ที่ใช้อยู่จริง

| Endpoint | ใช้ทำอะไรในโปรเจกต์ |
|---|---|
| `POST /lottery/getLatestLottery` | ผลรางวัลงวดล่าสุด |
| `POST /mission/getMissionStatsRewardPrevious` | สถิติ 2 ตัวท้าย / 3 ตัวหน้า / 3 ตัวท้าย |
| `POST /lottery/getPeriodList` | ใช้ใน debug route เพื่อ probe endpoint |
| `POST /checking/getLotteryResult` | ใช้ใน debug route เท่านั้น ไม่ใช้ใน production flow |

ข้อควรรู้:

- โปรเจกต์ normalize ข้อมูลผลรางวัลเป็น `GloLotteryResult`
- endpoint `getLotteryResult` สำหรับงวดย้อนหลังไม่น่าเชื่อถือและไม่ใช่แหล่งข้อมูลหลักของแอป

## Getting Started

```bash
npm install
npm run dev
```

เปิด `http://localhost:3000`

คำสั่งที่ใช้บ่อย:

```bash
npm run dev
npm run build
npm run lint
```

## Project Status

- Phase 1: MVP และประวัติการสุ่ม เสร็จแล้ว
- Phase 2: GLO integration, stats, insight, Quantum mode เสร็จแล้ว
- Phase 3: cross-device history / auth / analytics ยังเป็นแผนในอนาคต

## Important Notes

- แอปนี้ไม่ได้ทำนายผลหวยจริง เป็นเพียงการสุ่มแบบถ่วงน้ำหนัก
- การสุ่มยังใช้ `Math.random()` เป็นฐาน
- ข้อมูลจาก GLO อาจเปลี่ยนโครงสร้างได้ จึงควรเช็ก route debug หรือ route handlers ก่อนแก้ integration

## For Contributors

ถ้าจะเข้ามาแก้ต่อ แนะนำให้อ่านไฟล์ตามลำดับนี้:

1. [AGENTS.md](/Users/anupong/Projects/YorLotto/AGENTS.md:1)
2. [app/page.tsx](/Users/anupong/Projects/YorLotto/app/page.tsx:1)
3. [lib/lotto-engine.ts](/Users/anupong/Projects/YorLotto/lib/lotto-engine.ts:1)
4. [app/api/glo/stats/route.ts](/Users/anupong/Projects/YorLotto/app/api/glo/stats/route.ts:1)
5. [app/api/glo/latest/route.ts](/Users/anupong/Projects/YorLotto/app/api/glo/latest/route.ts:1)
