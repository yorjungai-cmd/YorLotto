@AGENTS.md

# Claude-specific Instructions

## อ่านก่อนเขียนโค้ดทุกครั้ง

- Next.js 16 มี breaking changes — อ่าน `node_modules/next/dist/docs/` ก่อนใช้ API ใหม่
- Route Handlers ใช้ `export async function GET/POST(request: Request)` ไม่ใช่ `export default`
- `use cache` ต้องการ `experimental: { dynamicIO: true }` ใน next.config.ts — ยังไม่เปิดใช้ใน project นี้

## ลำดับการทำงาน

1. อ่านไฟล์ที่เกี่ยวข้องก่อนแก้ไขเสมอ
2. แก้ `lib/` ก่อน แล้วค่อยอัปเดต `app/page.tsx`
3. `npm run build` ต้องผ่านก่อน commit ทุกครั้ง
4. `git add` เฉพาะไฟล์ที่แก้ — ไม่ใช้ `git add .` ถ้าไม่ตรวจก่อน

## สิ่งที่ห้ามทำ

- ห้ามลบ algorithm layers ใน `lib/lotto-engine.ts` โดยไม่มีเหตุผล
- ห้ามเปลี่ยน `GloLotteryResult.prizes` กลับเป็น `GloPrizeEntry` — structure นี้ normalize แล้ว
- ห้าม hardcode GLO response field เพิ่มเติมโดยไม่ทดสอบ curl ก่อน
- ห้ามเพิ่ม `console.log` ใน production code

## Commit Message Format

```
type: short description (ภาษาอังกฤษ)

optional body (ภาษาไทยหรืออังกฤษก็ได้)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

types: `feat` `fix` `style` `refactor` `docs` `chore`
