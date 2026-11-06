// แปลงคำตอบ onboarding (ปุ่มตัวเลือก) ⇄ คอลัมน์ในตาราง profile
// ถามเฉพาะสิ่งที่แอปใช้จริง:
//   nick    → ชื่อที่แสดง          yob    → ปีเกิด (อายุ)          act → ป้ายระดับบนโปรไฟล์
//   battery → ค่าเริ่มต้นของแถบแบตทุกวัน   durs → จัดลำดับคลิปให้ตรงความยาวที่ชอบ
//   goal    → เป้าหมายสัปดาห์ในโปรไฟล์   mode → หน้าหลักเปิดมาที่โหมดนี้
import type { Mode, Profile } from "./types";

export type Answers = {
  nick: string;
  yob: string;
  act: string;
  battery: number;
  durs: string[];
  goal: string;
  mode: Mode;
  selfie: boolean;
  bio: string;
};

export const DEFAULT_ANSWERS: Answers = {
  nick: "",
  yob: "",
  act: "act_new",
  battery: 40,
  durs: ["d5", "d10"],
  goal: "g3",
  mode: "workout",
  selfie: true,
  bio: "",
};

const GOAL_N: Record<string, number> = { g2: 2, g3: 3, g5: 5, g7: 7 };

/** ค่าที่ใกล้ที่สุดในตาราง (ใช้ตอนแปลงตัวเลขกลับเป็นปุ่มตัวเลือก) */
const nearestKey = (table: Record<string, number>, v: number | null, fallback: string) => {
  if (v == null) return fallback;
  let best = fallback;
  let diff = Infinity;
  Object.entries(table).forEach(([k, n]) => {
    if (Math.abs(n - v) < diff) {
      diff = Math.abs(n - v);
      best = k;
    }
  });
  return best;
};

export const durMinutes = (durs: string[]) => durs.map((d) => parseInt(d.slice(1), 10)).filter((n) => !isNaN(n));

/** ปีเกิด พ.ศ. หรือ ค.ศ. → ค.ศ. (ไม่ถูกต้อง = null) */
export const birthYearCE = (yob: string) => {
  let y = parseInt(yob, 10);
  if (isNaN(y)) return null;
  if (y > 2400) y -= 543;
  const now = new Date().getFullYear();
  return y >= 1900 && y <= now - 10 ? y : null;
};

export const toProfilePatch = (a: Answers): Partial<Profile> => ({
  username: a.nick.trim() || null,
  bio: a.bio.trim() || null,
  birth_year: birthYearCE(a.yob),
  activity_level: a.act,
  energy_score: a.battery,
  preferred_durations: durMinutes(a.durs),
  workout_days_per_week: GOAL_N[a.goal] ?? 3,
  preferred_workouts: [a.mode],
  selfie_enabled: a.selfie,
});

export const fromProfile = (p: Profile): Answers => ({
  nick: p.username ?? "",
  yob: p.birth_year ? String(p.birth_year) : "",
  act: p.activity_level ?? DEFAULT_ANSWERS.act,
  battery: p.energy_score ?? DEFAULT_ANSWERS.battery,
  durs: (p.preferred_durations ?? []).map((m) => "d" + m),
  goal: nearestKey(GOAL_N, p.workout_days_per_week, DEFAULT_ANSWERS.goal),
  mode: p.preferred_workouts?.[0] === "dance" ? "dance" : "workout",
  selfie: p.selfie_enabled,
  bio: p.bio ?? "",
});

/** แปลงโหมด ⇄ ชื่อปุ่มตัวเลือก (ใช้กับ <Chips>) */
export const MODE_CHIPS = ["modeWorkout", "modeDance"];
export const modeChip = (m: Mode) => (m === "dance" ? "modeDance" : "modeWorkout");
export const chipMode = (c: string): Mode => (c === "modeDance" ? "dance" : "workout");
