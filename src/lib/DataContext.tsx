import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";

import * as api from "./api";
import { useAuth } from "./AuthContext";
import { dayKey, playStats, toDate, type PlayStat } from "./logic";
import type { Clip, LevelKey, LogEntry, Mode, Notif } from "./types";

/** เปลี่ยนค่าเมื่อขึ้นวันใหม่ (เช็กทุก 30 วินาที และทุกครั้งที่กลับมาเปิดแอป) */
export function useToday() {
  const [k, setK] = useState(dayKey());
  useEffect(() => {
    const check = () => setK((old) => (old === dayKey() ? old : dayKey()));
    const id = setInterval(check, 30000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && check());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);
  return k;
}

type DataValue = {
  today: string;
  clips: Clip[];
  logs: LogEntry[];
  stats: Record<string, PlayStat>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  // วันนี้ (แบตกลับเป็นค่าปกติเองเมื่อขึ้นวันใหม่)
  battery: number;
  setBattery: (v: number) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  rot: Record<string, number>;
  bumpRot: (key: string) => void;
  // บันทึก
  logClip: (clip: Clip) => Promise<LogEntry>;
  undoLog: (id: string) => Promise<void>;
  // เซลฟี่หลังออกกำลังกาย (ส่วนตัว)
  addSelfie: (logId: string, uri: string, mime: string | null) => Promise<void>;
  deleteSelfie: (logId: string) => Promise<void>;
  addClip: (input: { title: string; min: number; vid: string; pct: number; level: LevelKey }) => Promise<void>;
  removeClip: (id: string) => Promise<void>;
  // แชร์จากหน้าหลักไปหน้าชุมชน
  draft: string | null;
  setDraft: (s: string | null) => void;
  // การแจ้งเตือน
  notifs: Notif[];
  unread: number;
  reloadNotifs: () => void;
  markRead: (ids: string[]) => Promise<void>;
};

type Store = { uid: string | null; clips: Clip[]; logs: LogEntry[]; levels: api.LevelIds | null };

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { userId, profile } = useAuth();
  const today = useToday();
  const [store, setStore] = useState<Store>({ uid: null, clips: [], logs: [], levels: null });
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  const [picked, setPicked] = useState<{ date: string; battery: number } | null>(null);
  const [pickedMode, setMode] = useState<Mode | null>(null);
  const [rot, setRot] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<string | null>(null);
  const [dbNotifs, setDbNotifs] = useState<Notif[]>([]);
  const [nudgeRead, setNudgeRead] = useState<string | null>(null);
  const [notifCount, setNotifCount] = useState(0);

  // โหลดคลิป + ประวัติ + ระดับพลังงาน — ตอนล็อกอิน และทุกครั้งที่กด "ลองใหม่"
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    Promise.all([api.fetchClips(), api.fetchLogs(), api.fetchLevels()])
      .then(([clips, logs, levels]) => {
        if (!alive) return;
        setStore({ uid: userId, clips, logs, levels });
        setError(null);
      })
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setFetching(false));
    return () => {
      alive = false;
    };
  }, [userId, reloadCount]);

  // การแจ้งเตือน
  useEffect(() => {
    if (!userId) return;
    api.fetchNotifs().then(setDbNotifs).catch(() => {});
  }, [userId, notifCount]);

  const mine = store.uid === userId; // ข้อมูลที่มีเป็นของผู้ใช้คนปัจจุบันหรือยัง
  const clips = mine ? store.clips : [];
  const logs = mine ? store.logs : [];
  // โหมด: ถ้ายังไม่ได้กดเลือก ใช้โหมดที่ชอบจากโปรไฟล์
  const mode: Mode = pickedMode ?? (profile?.preferred_workouts?.[0] === "dance" ? "dance" : "workout");
  // แบตวันนี้: ถ้ายังไม่ได้เลื่อนในวันนี้ ใช้ค่าปกติจากโปรไฟล์
  const battery = picked && picked.date === today ? picked.battery : profile?.energy_score ?? 50;

  const reload = () => {
    setError(null);
    setFetching(true);
    setReloadCount((n) => n + 1);
  };
  const reloadNotifs = () => setNotifCount((n) => n + 1);

  const logClip = async (clip: Clip) => {
    const entry = await api.addLog(clip, battery);
    setStore((s) => ({ ...s, logs: [entry, ...s.logs] }));
    return entry;
  };
  const undoLog = async (id: string) => {
    const old = logs.find((e) => e.id === id);
    await api.deleteLog(id);
    setStore((s) => ({ ...s, logs: s.logs.filter((e) => e.id !== id) }));
    if (old?.selfie) api.removeSelfie(null, old.selfie).catch(() => {}); // ไม่ทิ้งไฟล์เซลฟี่ค้างในที่เก็บ
  };
  const addSelfie = async (logId: string, uri: string, mime: string | null) => {
    if (!userId) return;
    const path = await api.uploadSelfie(userId, logId, uri, mime);
    setStore((s) => ({ ...s, logs: s.logs.map((e) => (e.id === logId ? { ...e, selfie: path } : e)) }));
  };
  const deleteSelfie = async (logId: string) => {
    const old = logs.find((e) => e.id === logId);
    if (!old?.selfie) return;
    await api.removeSelfie(logId, old.selfie);
    setStore((s) => ({ ...s, logs: s.logs.map((e) => (e.id === logId ? { ...e, selfie: null } : e)) }));
  };
  const addClip = async (input: { title: string; min: number; vid: string; pct: number; level: LevelKey }) => {
    if (!userId || !store.levels) return;
    const c = await api.addOwnClip(userId, { ...input, mode }, store.levels);
    setStore((s) => ({ ...s, clips: [c, ...s.clips] }));
  };
  const removeClip = async (id: string) => {
    await api.deleteOwnClip(id);
    setStore((s) => ({ ...s, clips: s.clips.filter((c) => c.id !== id) }));
  };

  // การแจ้งเตือน "วันนี้ยังไม่ได้ขยับ" สร้างในแอป (ไม่ได้เก็บในฐานข้อมูล)
  const doneToday = logs.some((e) => e.day === today);
  const nudge: Notif[] =
    doneToday || !mine
      ? []
      : [{ id: "nudge-" + today, type: "nudge", actorId: null, postId: null, text: null, read: nudgeRead === today, at: toDate(today).getTime() }];
  const notifs = [...nudge, ...dbNotifs];

  const markRead = async (ids: string[]) => {
    if (ids.includes("nudge-" + today)) setNudgeRead(today);
    const dbIds = ids.filter((id) => !id.startsWith("nudge-"));
    setDbNotifs((old) => old.map((n) => (dbIds.includes(n.id) ? { ...n, read: true } : n)));
    await api.markNotifsRead(dbIds);
  };

  return (
    <DataContext.Provider
      value={{
        today,
        clips,
        logs,
        stats: playStats(logs, today),
        loading: !!userId && (!mine || fetching) && !error,
        error,
        reload,
        battery,
        setBattery: (v) => setPicked({ date: today, battery: v }),
        mode,
        setMode,
        rot,
        bumpRot: (key) => setRot((r) => ({ ...r, [key]: (r[key] ?? 0) + 1 })),
        logClip,
        undoLog,
        addSelfie,
        deleteSelfie,
        addClip,
        removeClip,
        draft,
        setDraft,
        notifs,
        unread: notifs.filter((n) => !n.read).length,
        reloadNotifs,
        markRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData ต้องอยู่ภายใน <DataProvider>");
  return ctx;
}
