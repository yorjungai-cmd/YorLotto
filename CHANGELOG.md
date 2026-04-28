# Changelog

รายการการเปลี่ยนแปลงของ Yor Lotto แต่ละ version

---

## [Unreleased]

### Planned (Phase 3)
- Firebase Firestore cache ผลรางวัล GLO
- Firebase Auth — ระบบ login
- ประวัติการสุ่มข้ามเครื่อง
- Firebase Analytics

---

## Phase 2 — GLO Integration + Smart Mode

### Added
- ผลรางวัลงวดล่าสุดจาก GLO แสดงบนหน้าหลัก (รางวัลที่ 1, 3 ตัวหน้า, 3 ตัวท้าย, 2 ตัวท้าย)
- สถิติเลขร้อน/เลขเย็น 2 ตัวและ 3 ตัวท้าย พร้อม bar chart
- Period selector (6/12/24 งวด) สำหรับสถิติ
- Insight หลังสุ่ม — บอก rank และความถี่ของเลขที่สุ่มได้
- โหมด `✦ ชาญฉลาด` — weighted random จาก GLO stats + history penalty + anti-repeat
- ปุ่ม "ทดสอบ Connection GLO" แสดงสถานะ, latency, preview ทุก endpoint
- API Routes: `/api/glo/latest`, `/api/glo/stats`, `/api/glo/debug`
- Dynamic hero text countdown (อีก N วันรวย / วันนี้รวย / พรุ่งนี้รวย)

### Fixed
- GLO response structure: `data.last2/last3f/last3b` พร้อม `{value}` object
- เปลี่ยนสถิติจาก `getLotteryResult` (คืน null) ไปใช้ `getMissionStatsRewardPrevious`
- `getPeriodList` ใช้ `response.list` ไม่ใช่ `response.periodList`

### Changed
- `LottoMode` เพิ่ม `'smart'` type
- `generateLotto()` รับ `options: { stats?, history? }` เพิ่มเติม
- `GloLotteryResult.prizes` เป็น `string[]` แทน `GloPrizeEntry`

---

## Phase 1 — MVP

### Added
- สุ่มเลข 6 หลัก, 3 ตัวท้าย, 2 ตัวท้าย ในครั้งเดียว
- สุ่มหลายชุด: 1, 5, 10 ชุด
- โหมด `สุ่มล้วน` — โอกาสเท่ากันทุกเลข
- โหมด `ผสมวันเกิด` — birthday digits มีโอกาส 45% ถูกเลือก
- ปุ่มคัดลอกผลลัพธ์ไปยัง clipboard
- ประวัติการสุ่มใน localStorage (สูงสุด 20 รายการ, แสดง 8)
- UI: hero section, control panel, result cards, history list
- Font: IBM Plex Sans Thai + Material Symbols Outlined
- Responsive design (mobile + desktop)
- Deploy-ready บน Vercel
