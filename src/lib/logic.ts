// ฟังก์ชันคำนวณล้วน ๆ (ไม่แตะฐานข้อมูล) — ทดสอบง่าย ใช้ซ้ำได้ทุกหน้าจอ
import type { Clip, LevelKey, LogEntry } from "./types";

/* ---------- ระดับพลังงาน: 5 ช่วง ช่วงละ 20% ---------- */
export const LEVELS: { key: LevelKey; min: number; max: number; mid: number }[] = [
  { key: "empty", min: 0, max: 19, mid: 10 },
  { key: "low", min: 20, max: 39, mid: 30 },
  { key: "medium", min: 40, max: 59, mid: 50 },
  { key: "good", min: 60, max: 79, mid: 70 },
  { key: "high", min: 80, max: 100, mid: 90 },
];
export const tierOf = (battery: number): LevelKey =>
  (LEVELS.find((l) => battery <= l.max) ?? LEVELS[LEVELS.length - 1]).key;
export const levelIdx = (key: LevelKey) => LEVELS.findIndex((l) => l.key === key);

/* ---------- วันที่ (yyyy-mm-dd ตรงกับคอลัมน์ date ใน Supabase) ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toDate = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const daysBetween = (later: string, earlier: string) =>
  Math.round((toDate(later).getTime() - toDate(earlier).getTime()) / 86400000);
const shift = (k: string, n: number) => {
  const d = toDate(k);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};

/** วันติดกันจนถึงวันนี้ (ถ้าวันนี้ยังไม่ทำ นับถึงเมื่อวาน) */
export const calcStreak = (days: Set<string>, today: string) => {
  let d = days.has(today) ? today : shift(today, -1);
  let n = 0;
  while (days.has(d)) {
    n += 1;
    d = shift(d, -1);
  }
  return n;
};

export const longestStreak = (days: Set<string>) => {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  sorted.forEach((k, i) => {
    run = i > 0 && daysBetween(k, sorted[i - 1]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
};

/** สัปดาห์นี้ (จันทร์ → อาทิตย์) วันไหนออกกำลังกายแล้ว */
export const weekDone = (days: Set<string>, today: string) => {
  const mon = (toDate(today).getDay() + 6) % 7;
  return [0, 1, 2, 3, 4, 5, 6].map((i) => days.has(shift(today, i - mon)));
};

/* ---------- สถิติการเล่นคลิป ---------- */
export type PlayStat = { count: number; last: number };
export const playStats = (logs: LogEntry[], today: string) => {
  const st: Record<string, PlayStat> = {};
  logs.forEach((e) => {
    if (!e.clipId) return;
    const x = st[e.clipId] ?? (st[e.clipId] = { count: 0, last: 9999 });
    x.count += 1;
    x.last = Math.min(x.last, daysBetween(today, e.day));
  });
  return st;
};

/** ค่าเดิมได้เลขเดิมเสมอ (0..1) — ลำดับคลิปเปลี่ยนทุกวัน แต่คงที่ภายในวันเดียวกัน */
export const seedRand = (str: string) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
};

/**
 * หมุนเวียนคลิป: คลิปที่เพิ่งเล่น (ภายใน 2 วัน) ไปอยู่ท้าย, คลิปที่เล่นบ่อยถูกเลื่อนลง,
 * ลำดับสุ่มใหม่ทุกวัน และ rot เลื่อนไปคลิปถัดไปเมื่อกลับมาระดับเดิม / กด "คลิปอื่น"
 */
export function orderClips(
  list: Clip[],
  opts: { today: string; stats: Record<string, PlayStat>; prefMins: number[]; rot: number },
) {
  const { today, stats, prefMins, rot } = opts;
  const fitsPref = (m: number) => !prefMins.length || prefMins.some((p) => Math.abs(p - m) <= 3);
  const fresh = (c: Clip) => !stats[c.id] || stats[c.id].last > 2;
  const score = (c: Clip) => {
    const st = stats[c.id];
    let sc = seedRand(today + ":" + c.id) * 10;
    if (st) {
      sc += st.count * 4;
      sc += st.last === 0 ? 1000 : st.last <= 2 ? 100 : st.last <= 6 ? 25 : 0;
    }
    if (!fitsPref(c.min)) sc += 6;
    return sc;
  };
  const sorted = [...list].sort((a, b) => score(a) - score(b));
  const f = sorted.filter(fresh);
  const old = sorted.filter((c) => !fresh(c));
  const o = f.length ? rot % f.length : 0;
  return [...f.slice(o), ...f.slice(0, o), ...old];
}

/* ---------- อื่น ๆ ---------- */
export const ytId = (u: string) => {
  const m = String(u)
    .trim()
    .match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
};

export const fmtViews = (n: number) =>
  n >= 1e9 ? (n / 1e9).toFixed(1) + "B" : n >= 1e7 ? Math.round(n / 1e6) + "M" : (n / 1e6).toFixed(1) + "M";
