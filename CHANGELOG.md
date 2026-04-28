# Changelog

รายการการเปลี่ยนแปลงของ Yor Lotto แต่ละ phase

---

## [Unreleased]

### Planned (Phase 3)
- Firebase Firestore cache ผลรางวัล GLO
- Firebase Auth — optional login
- ประวัติการสุ่มข้ามเครื่อง
- Firebase Analytics
- Dashboard สถิติ interactive chart

---

## Phase 2.3 — Gender Selection

### Added
- ตัวเลือกเพศ (ชาย/หญิง) ใน Quantum mode (ไม่บังคับ, กดซ้ำเพื่อยกเลิก)
- Gender weighting layer ในสูตร Quantum อิงหลักเลขศาสตร์ไทย Yin/Yang:
  - **ชาย (Yang)**: เลขคี่ × 1.5, เลขคู่ × 0.7, ตำแหน่ง Yang (pos 0,2,4) amplify × 1.4
  - **หญิง (Yin)**: เลขคู่ × 1.5, เลขคี่ × 0.7, ตำแหน่ง Yin (pos 1,3,5) amplify × 1.4
- Gender multiplier cross-multiplied กับ GLO frequency weight ทุก pool

---

## Phase 2.2 — Quantum Mode (Smart Mode)

### Added
- โหมด `✦ Quantum` (เดิมชื่อ `smart`) — weighted random จาก GLO stats
- `GenerateOptions` interface รับ `stats`, `history`, `birthday`, `gender`
- Algorithm 6 layers: GLO weight → birthday → gender → position → history penalty → anti-repeat
- `export type Gender = 'male' | 'female'`
- UI mode selector เหลือแค่ Normal / ✦ Quantum
- hint แสดงจำนวน stat และ history ที่ใช้

### Changed
- `LottoMode` ลบ `'birthday'` ออกจาก UI (คง type ไว้ใน engine สำหรับ backward compat)
- `generateLotto()` signature เพิ่ม `options: GenerateOptions`

---

## Phase 2.1 — GLO API Fix

### Fixed
- `getLatestLottery`: field จริงคือ `data.last2/last3f/last3b` และ number เป็น `[{value}]`
- `getPeriodList`: `response.list` คือ `string[]` ไม่ใช่ `response.periodList`
- เปลี่ยน stats endpoint จาก `getLotteryResult` (คืน null) → `getMissionStatsRewardPrevious`

### Added
- `/api/glo/debug` — probe ทุก endpoint พร้อม latency + preview
- ปุ่ม "ทดสอบ Connection GLO" ใน control panel

---

## Phase 2.0 — GLO Integration

### Added
- ผลรางวัลงวดล่าสุดจาก GLO (รางวัลที่ 1, 3 ตัวหน้า, 3 ตัวท้าย, 2 ตัวท้าย)
- สถิติเลขร้อน/เลขเย็น 2 ตัวและ 3 ตัวท้าย พร้อม bar chart
- Period selector (6/12/24 งวด)
- Insight หลังสุ่ม — rank และความถี่จาก GLO stats
- Hero text countdown แบบ dynamic (อีก N วันรวย / วันนี้รวย)
- API Routes: `/api/glo/latest`, `/api/glo/stats`
- `lib/glo-types.ts`, `lib/stats-engine.ts`, `lib/date-utils.ts`

---

## Phase 1 — MVP

### Added
- สุ่มเลข 6 หลัก, 3 ตัวท้าย, 2 ตัวท้าย ในครั้งเดียว
- จำนวนชุด: 1, 5, 10
- โหมดสุ่มล้วน (pure) และผสมวันเกิด (birthday)
- ปุ่ม copy ผลลัพธ์ไปยัง clipboard
- ประวัติการสุ่มใน localStorage (สูงสุด 20 รายการ, แสดง 8)
- UI: hero section, control panel, result cards, history list
- Font: IBM Plex Sans Thai + Material Symbols Outlined
- Responsive design (mobile + desktop)
- Deploy-ready บน Vercel
