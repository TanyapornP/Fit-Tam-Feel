import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchProfile, updateProfile } from "./api";
import { supabase } from "./supabase";
import type { Profile } from "./types";

type AuthValue = {
  session: Session | null;
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  loading: boolean; // กำลังเช็กว่าเคยล็อกอินไว้ไหม / กำลังโหลดโปรไฟล์
  error: string | null;
  reloadProfile: () => void;
  saveProfile: (patch: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  // เก็บโปรไฟล์คู่กับ id ของเจ้าของ (ถ้าเปลี่ยนบัญชี จะไม่เห็นโปรไฟล์ของคนก่อน)
  const [prof, setProf] = useState<{ uid: string; data: Profile } | null>(null);
  const [err, setErr] = useState<{ uid: string; msg: string } | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const userId = session?.user.id ?? null;

  // 1) ตอนเปิดแอป: ดู session ที่จำไว้ + ฟังการเปลี่ยนแปลง (ล็อกอิน / ออกจากระบบ)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // 2) ได้ผู้ใช้แล้ว → โหลดโปรไฟล์ของคนนั้น
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    fetchProfile(userId)
      .then((data) => {
        if (!alive) return;
        setProf({ uid: userId, data });
        setErr(null);
      })
      .catch((e: Error) => alive && setErr({ uid: userId, msg: e.message }));
    return () => {
      alive = false;
    };
  }, [userId, reloadCount]);

  const profile = prof && prof.uid === userId ? prof.data : null;
  const error = err && err.uid === userId ? err.msg : null;

  const saveProfile = async (patch: Partial<Profile>) => {
    if (!userId) return;
    const data = await updateProfile(userId, patch); // ถ้าบันทึกไม่ผ่าน จะโยน error ให้หน้าจอแสดงเอง
    setProf({ uid: userId, data });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        userId,
        email: session?.user.email ?? null,
        profile,
        loading: checking || (!!userId && !profile && !error),
        error,
        reloadProfile: () => {
          setErr(null);
          setReloadCount((n) => n + 1);
        },
        saveProfile,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ต้องอยู่ภายใน <AuthProvider>");
  return ctx;
}
