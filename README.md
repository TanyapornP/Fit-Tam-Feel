# Fit-Tam-Feel 🌸 — ออกกำลังกายให้พอดีกับแบตของคุณ

แอปแนะนำคลิปออกกำลังกายจาก YouTube ตาม **ระดับพลังงานวันนี้** สำหรับนักศึกษาที่เดินทางไป-กลับหรือเรียนหนักจนพลังงานแต่ละวันไม่เท่ากัน
แค่ยืดเหยียด 5 นาทีบนเตียงก็นับว่าสำเร็จ — เน้นวินัย ไม่เน้นความหนัก

DX212 Mobile Programming · ภาค 1/2569 · ทีม **tubtimfangfangjulieInwza007swagg**

| ชื่อ | รหัสนักศึกษา | ตำแหน่ง |
|---|---|---|
| จิตตชนก ครุฑทอง | 6823765216 | Developer |
| ธันยพร เภสัชชา | 6823765364 | Scrum Master |
| นภัทร เจริญสุข | 6823765380 | Product Owner |

## ฟีเจอร์

- **Must story:** เลื่อนแถบพลังงาน 0–100% → ได้คลิป YouTube ที่ตรงกับพลังงาน (5 ระดับ ช่วงละ 20%) · โหมด 🏋️ ออกกำลังกาย / 💃 เต้น · คลิปทุกอันยอดวิว 1M+
- กด "ทำแล้ว" → บันทึกลงฐานข้อมูล · ความต่อเนื่อง (streak) · หมุนเวียนคลิปไม่ให้ซ้ำ
- โปรไฟล์ · สถิติ · ประวัติ + จำนวนครั้งที่เล่น · เปลี่ยนรูปโปรไฟล์
- ชุมชน: โพสต์ · ติดตาม · เป็นกำลังใจ · คอมเมนต์ · การแจ้งเตือน
- ภาษาไทย / อังกฤษ

## เริ่มใช้งาน

ต้องมี Node.js LTS, Git, VS Code (ชุดเดียวกับแลบ 8–10)

```bash
git clone https://github.com/TanyapornP/Fit-TAm-Feel.git
cd Fit-TAm-Feel
npm install
cp .env.example .env.local     # แล้วใส่ค่าจริงจาก Supabase (ขอได้จากทีม)
npx expo start                 # กด w = เว็บ · a = Android Emulator · สแกน QR = Expo Go
```

> **ต้องรัน `npm install` ก่อนทุกครั้ง** — repo นี้ไม่มีโฟลเดอร์ `node_modules`

### ตัวแปรใน `.env.local` (ห้าม commit — อยู่ใน .gitignore แล้ว)

| ชื่อ | ได้จาก |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → Publishable key |

### ก่อนส่ง / ก่อนเปิด Pull Request

```bash
npx tsc --noEmit    # ตรวจ type ต้องไม่มี error
npx expo lint       # ตรวจรูปแบบโค้ด
```

## โครงไฟล์ (ตามแม่แบบแลบ 10: Expo Router + TypeScript)

```
src/
├── app/                      ← หน้าจอ (1 ไฟล์ = 1 หน้า)
│   ├── _layout.tsx           ← ฟอนต์ + Provider + พาไปหน้าที่ถูก (login / onboarding / แท็บ)
│   ├── login.tsx             ← สมัคร / เข้าสู่ระบบ (Supabase Auth)
│   ├── onboarding.tsx        ← ตั้งค่าครั้งแรก 6 ขั้น
│   ├── (tabs)/
│   │   ├── _layout.tsx       ← แท็บล่าง 🏠 🌸 👤
│   │   ├── index.tsx         ← หน้าหลัก: แถบแบต + คลิปแนะนำ + ทำแล้ว
│   │   ├── community.tsx     ← ชุมชน
│   │   └── profile.tsx       ← โปรไฟล์ + สถิติ + ประวัติ
│   ├── notifications.tsx     ← การแจ้งเตือน
│   ├── person/[id].tsx       ← โปรไฟล์สมาชิก
│   └── people/[id].tsx       ← รายชื่อผู้ติดตาม / กำลังติดตาม
├── components/               ← ชิ้นส่วนที่ใช้ซ้ำ (การ์ดคลิป, แถบแบต, โพสต์ ...)
└── lib/
    ├── supabase.ts           ← ตัวเชื่อม Supabase (อ่านค่าจาก .env.local)
    ├── api.ts                ← ทุกคำสั่งอ่าน/เขียนฐานข้อมูล
    ├── AuthContext.tsx       ← สถานะล็อกอิน + profile
    ├── DataContext.tsx       ← คลิป · ประวัติ · การแจ้งเตือน (loading / error / reload)
    ├── useCommunity.ts       ← ข้อมูลหน้าชุมชน
    ├── logic.ts              ← ระดับพลังงาน · streak · หมุนเวียนคลิป (ฟังก์ชันล้วน)
    ├── answers.ts            ← แปลงคำตอบ onboarding ⇄ คอลัมน์ profile
    ├── i18n.tsx              ← ข้อความไทย / อังกฤษ
    ├── types.ts · theme.ts · styles.ts
```

## Architecture

```
แอป Expo (iOS / Android / เว็บ)
   │  supabase-js + publishable key
   ▼
Supabase ── Auth (อีเมล + รหัสผ่าน)
        ├── Postgres + RLS ── profile · public_profile · energy_table · workout_clip
        │                     user_did_it · posts · follows · post_likes · post_comments · notifications
        └── Storage ───────── avatars · post-images · selfies
   คลิปเปิดดูบน YouTube (ลิงก์ + รูปปกจาก img.youtube.com)
```

### ตารางหลักและ RLS (ทุกตารางเปิด Row Level Security)

| ตาราง | เก็บอะไร | ใครอ่าน / เขียนได้ |
|---|---|---|
| `profile` | ข้อมูลส่วนตัว + คำตอบ onboarding + streak | เจ้าของเท่านั้น |
| `public_profile` | ชื่อ · รูป · แนะนำตัว · streak (ซิงก์จาก profile ด้วย trigger) | สมาชิกอ่านได้ทุกคน |
| `energy_table` | 5 ระดับพลังงาน + ช่วง % | ทุกคนอ่านได้ |
| `workout_clip` | คลิปกลาง + คลิปที่ผู้ใช้เพิ่มเอง | อ่านคลิปกลาง + ของตัวเอง · เพิ่ม/ลบได้เฉพาะของตัวเอง |
| `user_did_it` | ประวัติการออกกำลังกาย (แบต · นาที · วันที่) | เจ้าของเท่านั้น |
| `posts` `post_likes` `post_comments` `follows` | ชุมชน | สมาชิกอ่านได้ · เขียนได้ในนามตัวเองเท่านั้น |
| `notifications` | การแจ้งเตือน (trigger สร้างให้) | เจ้าของเท่านั้น |

ตัวอย่าง policy (`user_did_it`): อ่าน/เพิ่ม/ลบได้เฉพาะแถวที่ `user_id = auth.uid()`

```sql
create policy "user_did_it: read own" on public.user_did_it
  for select to authenticated using (user_id = (select auth.uid()));
```

## ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|---|---|
| `expo: command not found` / `Cannot find module` | ยังไม่ได้ `npm install` |
| ขึ้น "โหลดข้อมูลไม่สำเร็จ" ทุกหน้า | ยังไม่มี `.env.local` หรือใส่ค่าผิด → แก้แล้วรัน `npx expo start -c` |
| สมัครแล้วเข้าไม่ได้ | Supabase เปิด "Confirm email" อยู่ → กดลิงก์ในอีเมลก่อน หรือปิดที่ Authentication → Sign In / Providers → Email |
| Expo Go ขึ้น incompatible SDK | อัปเดต Expo Go หรือกด `w` / `a` แทน |
| มือถือสแกน QR แล้วต่อไม่ได้ (Wi-Fi มหาวิทยาลัย) | `npx expo start --tunnel` |
