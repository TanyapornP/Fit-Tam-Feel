// แปลงคำตอบ onboarding (ปุ่มตัวเลือก) ⇄ คอลัมน์ในตาราง profile
import type { Profile } from "./types";

export type Answers = {
  nick: string;
  yob: string;
  act: string;
  day: string;
  out: string;
  free: string;
  drained: string[];
  battery: number;
  sleep: string;
  cats: string[];
  durs: string[];
  where: string;
  limits: string[];
  goal: string;
  remind: string;
  why: string[];
  selfie: boolean;
  bio: string;
};

export const DEFAULT_ANSWERS: Answers = {
  nick: "", yob: "", act: "act_new",
  day: "day_work", out: "out_8", free: "fr_evening",
  drained: ["dr_after"], battery: 40, sleep: "sl_67",
  cats: ["c_stretch", "c_yoga"], durs: ["d5", "d10"], where: "w_bed", limits: ["l_none"],
  goal: "g3", remind: "r7", why: ["y_cons"], selfie: true, bio: "",
};

const OUT_H: Record<string, number> = { out_4: 3, out_8: 6, out_12: 10, out_12p: 13 };
const SLEEP_H: Record<string, number> = { sl_u5: 4.5, sl_56: 5.5, sl_67: 6.5, sl_78: 7.5, sl_8p: 8.5 };
const GOAL_N: Record<string, number> = { g2: 2, g3: 3, g5: 5, g7: 7 };
const REMIND_T: Record<string, string | null> = { r5: "17:00", r7: "19:00", r9: "21:00", r0: null };

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

/** ปีเกิด พ.ศ. → ค.ศ. */
export const birthYearCE = (yob: string) => {
  let y = parseInt(yob, 10);
  if (isNaN(y)) return null;
  if (y > 2400) y -= 543;
  return y >= 1900 && y <= new Date().getFullYear() ? y : null;
};

export const toProfilePatch = (a: Answers): Partial<Profile> => ({
  username: a.nick.trim() || null,
  bio: a.bio.trim() || null,
  birth_year: birthYearCE(a.yob),
  activity_level: a.act,
  daily_main_activity: a.day,
  hours_outside_home: OUT_H[a.out] ?? null,
  free_time_periods: [a.free],
  most_tired_period: a.drained,
  energy_score: a.battery,
  average_sleep_hours: SLEEP_H[a.sleep] ?? null,
  preferred_workouts: a.cats,
  preferred_durations: durMinutes(a.durs),
  workout_location: a.where,
  focus_areas: a.limits,
  workout_days_per_week: GOAL_N[a.goal] ?? 3,
  notification_time: REMIND_T[a.remind] ?? null,
  fitness_goal: a.why,
  selfie_enabled: a.selfie,
});

export const fromProfile = (p: Profile): Answers => {
  const remindKey =
    Object.keys(REMIND_T).find((k) => REMIND_T[k] && p.notification_time?.startsWith(REMIND_T[k] as string)) ?? "r0";
  return {
    nick: p.username ?? "",
    yob: p.birth_year ? String(p.birth_year) : "",
    act: p.activity_level ?? DEFAULT_ANSWERS.act,
    day: p.daily_main_activity ?? DEFAULT_ANSWERS.day,
    out: nearestKey(OUT_H, p.hours_outside_home, DEFAULT_ANSWERS.out),
    free: p.free_time_periods?.[0] ?? DEFAULT_ANSWERS.free,
    drained: p.most_tired_period ?? DEFAULT_ANSWERS.drained,
    battery: p.energy_score ?? DEFAULT_ANSWERS.battery,
    sleep: nearestKey(SLEEP_H, p.average_sleep_hours, DEFAULT_ANSWERS.sleep),
    cats: p.preferred_workouts ?? DEFAULT_ANSWERS.cats,
    durs: (p.preferred_durations ?? []).map((m) => "d" + m),
    where: p.workout_location ?? DEFAULT_ANSWERS.where,
    limits: p.focus_areas ?? DEFAULT_ANSWERS.limits,
    goal: nearestKey(GOAL_N, p.workout_days_per_week, DEFAULT_ANSWERS.goal),
    remind: p.notification_time ? remindKey : "r0",
    why: p.fitness_goal ?? DEFAULT_ANSWERS.why,
    selfie: p.selfie_enabled,
    bio: p.bio ?? "",
  };
};
